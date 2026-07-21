import os, re
from datetime import datetime, timezone, timedelta
base = r"C:\Users\Administrator\Desktop\Hermes_工作区\报价器"
ts = datetime.now(timezone(timedelta(hours=8))).strftime("%Y.%m.%d %H:%M")
fpath = os.path.join(base, "index.html")
with open(fpath, "r", encoding="utf-8") as f:
    lines = f.readlines()
c = ''.join(lines)

# === 6. Two-piece molding ===
# Add checkbox in刀版 h2
c = c.replace(
    '<h2 style="display:flex;align-items:center"><span>\U0001f52a \u5200\u7248</span></h2>',
    '<h2 style="display:flex;align-items:center"><span>\U0001f52a \u5200\u7248</span><span style="margin-left:auto;font-size:0.75rem;font-weight:normal;cursor:pointer;color:#3498db"><input type="checkbox" id="twoPiece" onchange="var c2=document.getElementById(\'twoPieceCard\');c2.style.display=this.checked?\'block\':\'none\';if(!this.checked){document.querySelector(\'input[name=twoPieceMode][value=same]\').checked=true;toggleTwoPieceMode()}" style="width:auto;height:auto;vertical-align:middle"> \u4e24\u7247\u6210\u578b</span></h2>'
)

# Add twoPieceCard inside刀版 card (before closing)
c = c.replace(
    '</div>\n</div>\n\n<div class="card">\n    <h2>\U0001f4c4 \u9762\u7eb8</h2>',
    '</div>\n    <div id="twoPieceCard" style="display:none;margin-top:8px">\n        <div class="row" style="margin-bottom:4px">\n            <label style="font-size:0.85rem;font-weight:600">\u4e24\u7247\u6210\u578b\uff1a</label>\n            <label style="font-size:0.85rem;cursor:pointer;margin-right:12px"><input type="radio" name="twoPieceMode" value="same" checked onchange="toggleTwoPieceMode()"> \u540c\u7eb8</label>\n            <label style="font-size:0.85rem;cursor:pointer"><input type="radio" name="twoPieceMode" value="split" onchange="toggleTwoPieceMode()"> \u5206\u5370</label>\n        </div>\n        <div id="twoPieceSplit" style="display:none">\n            <div class="row">\n                <div class="field"><label>\u5200\u72482\u957f (mm)</label><input type="number" id="dieL2" value="" step="1" placeholder=""></div>\n                <div class="field"><label>\u5200\u72482\u5bbd (mm)</label><input type="number" id="dieW2" value="" step="1" placeholder=""></div>\n                <div class="field"><label>\u62fc\u7248\u65702 (\u4e2a/\u5f20)</label><div style="display:flex;gap:0"><button onclick="adjInput(\'piecesPerSheet2\',-1,1)" style="padding:8px 10px;border:1px solid #ddd;border-radius:6px 0 0 6px;cursor:pointer;background:#f5f5f5;font-size:0.9rem">\u2212</button><input type="number" id="piecesPerSheet2" value="1" step="1" style="text-align:center;border-radius:0;border-left:0;border-right:0"><button onclick="adjInput(\'piecesPerSheet2\',1,1)" style="padding:8px 10px;border:1px solid #ddd;border-radius:0 6px 6px 0;cursor:pointer;background:#f5f5f5;font-size:0.9rem">+</button></div></div>\n            </div>\n        </div>\n    </div>\n</div>\n\n<div class="card">\n    <h2>\U0001f4c4 \u9762\u7eb8</h2>'
)

# Add toggleTwoPieceMode + same-paper glue double
c = c.replace(
    'function calculate(){',
    'function toggleTwoPieceMode(){\n  var split=document.querySelector(\'input[name="twoPieceMode"]:checked\').value===\'split\';\n  document.getElementById(\'twoPieceSplit\').style.display=split?\'block\':\'none\';\n}\nfunction calculate(){'
)

# Same-paper: double glue
c = c.replace(
    'var glueCost=enGlue?(PRICE.glue[glueKey]||0)*qty:0;',
    'var glueCost=enGlue?(PRICE.glue[glueKey]||0)*qty:0;\n  // 两片成型-同纸：多一个糊口\n  if(document.getElementById(\'twoPiece\').checked&&document.querySelector(\'input[name="twoPieceMode"]:checked\').value===\'same\'){glueCost*=2;}'
)

# Split mode: add calculation block
old_ac = 'window._costs={\n    paper:paperTotal,flute:fluteTotal,'
split_block = """// 两片成型-分印
  if(document.getElementById('twoPiece').checked&&document.querySelector('input[name="twoPieceMode"]:checked').value==='split'){
    var dL2=parseFloat(document.getElementById('dieL2').value)||0;
    var dW2=parseFloat(document.getElementById('dieW2').value)||0;
    var nUp2=parseInt(document.getElementById('piecesPerSheet2').value)||1;
    if(dL2>0&&dW2>0){
      var _origL=document.getElementById('dieL').value;
      var _origW=document.getElementById('dieW').value;
      var _origNUp=document.getElementById('piecesPerSheet').value;
      document.getElementById('dieL').value=dL2;
      document.getElementById('dieW').value=dW2;
      document.getElementById('piecesPerSheet').value=nUp2;
      var pL2=dL2+20,pW2=dW2+20;
      var cutL2=pL2,cutW2=Math.ceil(pW2/50)*50;
      var pArea2=cutL2*cutW2/1000000;
      var sh2=Math.ceil(qty/nUp2);
      var pLoss2=parseFloat(document.getElementById('paperLoss').value);
      var pLossMul2=isNaN(pLoss2)||pLoss2===0?1.05:(sh2+pLoss2)/sh2;
      var paperRaw2=pricePerM2*pArea2;
      var paperPerSheet2=paperRaw2*pLossMul2;
      var paperTotal2=paperPerSheet2*sh2;
      var fL2=dL2+10,fW2=dW2+30;
      var fArea2=fL2*fW2/1000000;
      var fLoss2=parseFloat(document.getElementById('fluteLoss').value);
      var fLossMul2=isNaN(fLoss2)||fLoss2===0?1.03:(sh2+fLoss2)/sh2;
      var fluteRaw2=effFPrice*fArea2;
      var flutePerSheet2=fluteRaw2*fLossMul2;
      var fluteTotal2=flutePerSheet2*sh2;
      var front2=calcPressCost();
      var back2b=dualSide?calcPressCost(document.getElementById('colorsBack').value):null;
      var cc2=front2.costPerK+(back2b?back2b.costPerK:0);
      var pressTotal2=cc2*(qty/1000);
      var mountCost2=PRICE.mount*pArea2;
      var mountTotal2=mountCost2*sh2;
      var dcKey2=document.getElementById('dieCutMachine').value,dc2=PRICE.dieCut[dcKey2]||[0,0];
      var dieCutCost2=(document.getElementById('waiveDieSetup').checked?0:dc2[0])+dc2[1]*sh2;
      var glueCost2=(PRICE.glue[glueKey]||0)*qty;
      var dieFee2=isNewDie?pArea2*250:0;
      var surfaceCost2=0;
      if(enSurface){
        var sc2=document.querySelectorAll('#surfaceGroup input:checked');
        for(var si=0;si<sc2.length;si++){
          var c2=sc2[si];
          if(PRICE.surfaceFilm[c2.value]!==undefined)surfaceCost2+=PRICE.surfaceFilm[c2.value]*pArea2*sh2;
          else{surfaceCost2+=PRICE.surfaceK[c2.value]*qty;if(c2.value==='压纹')surfaceCost2+=PRICE.embossFee;}
        }
      }
      paperTotal+=paperTotal2;fluteTotal+=fluteTotal2;pressTotal+=pressTotal2;
      mountTotal+=mountTotal2;dieCutCost+=dieCutCost2;glueCost+=glueCost2;
      dieFee+=dieFee2;surfaceCost+=surfaceCost2;
      document.getElementById('dieL').value=_origL;
      document.getElementById('dieW').value=_origW;
      document.getElementById('piecesPerSheet').value=_origNUp;
      totalSheets=totalSheets+sh2;
      window._piece2={dL2:dL2,dW2:dW2,nUp2:nUp2,sh2:sh2,pArea2:pArea2,pLoss2:pLoss2,pLossMul2:pLossMul2,paperRaw2:paperRaw2,paperPerSheet2:paperPerSheet2,paperTotal2:paperTotal2,fL2:fL2,fArea2:fArea2,fLoss2:fLoss2,fLossMul2:fLossMul2,fluteRaw2:fluteRaw2,flutePerSheet2:flutePerSheet2,fluteTotal2:fluteTotal2,pressTotal2:pressTotal2,mountTotal2:mountTotal2,dieCutCost2:dieCutCost2,glueCost2:glueCost2,dieFee2:dieFee2,surfaceCost2:surfaceCost2,front_cn:front2.cn,dcKey2:dcKey2,dc2_1:dc2[1]};
    }
  }
window._costs={
    paper:paperTotal,flute:fluteTotal,"""

c = c.replace(old_ac, split_block)

# Add piece2 breakdown
glue_bd_marker = "if(enGlue){lines.push('\u3010\u7c98\u76d2\u3011'+glueKey"
glue_idx = c.find(glue_bd_marker)
block_end = c.find("\n  }\n  // \u8fd0\u8f93", glue_idx)

piece2_bd = """
  // 两片成型-分印 breakdown
  if(window._piece2){
    var p2=window._piece2;
    lines.push('');lines.push('<span style=background:#3498db;color:#fff;padding:3px 10px;border-radius:4px;font-weight:bold>\u2501\u2501\u2501 \u7b2c\u4e8c\u7247\u5206\u5370\u660e\u7ec6 \u2501\u2501\u2501</span>');
    if(enPaper){lines.push('\u3010\u9762\u7eb82\u3011'+gram+'g \u5428\u4ef7\xa5'+tonPrice);lines.push('  \u5200\u7248: '+p2.dL2+'\xd7'+p2.dW2+'mm \u2192 \u88c1\u5207: '+p2.pArea2.toFixed(4)+'\u33a1 \xd7 \xa5'+pricePerM2.toFixed(4)+' = \xa5'+p2.paperRaw2.toFixed(4));lines.push('  \u635f\u8017: ('+p2.sh2+'+'+(isNaN(p2.pLoss2)?0:p2.pLoss2)+')/'+p2.sh2+' = '+p2.pLossMul2.toFixed(4));lines.push('  \u5355\u5f20\u4ef7: \xa5'+p2.paperRaw2.toFixed(4)+' \xd7 '+p2.pLossMul2.toFixed(4)+' = \xa5'+p2.paperPerSheet2.toFixed(4)+'/\u5f20 \u2192 \xa5'+(p2.paperPerSheet2/p2.nUp2).toFixed(4)+'/\u4e2a');lines.push('  '+p2.sh2+'\u5f20 \u5c0f\u8ba1 \xa5'+p2.paperTotal2.toFixed(2));lines.push('');}
    if(enFlute){lines.push('\u3010\u6d6a\u7eb82\u3011\xa5'+fPrice.toFixed(2)+'/\u33a1');lines.push('  \u5200\u7248: '+p2.dL2+'\xd7'+p2.dW2+'mm \u2192 \u6d6a\u7eb8: '+p2.fL2+'\xd7'+(p2.dW2+30)+'mm = '+p2.fArea2.toFixed(4)+'\u33a1 \xd7 \xa5'+fPrice.toFixed(2)+' = \xa5'+p2.fluteRaw2.toFixed(4));lines.push('  \u635f\u8017: ('+p2.sh2+'+'+(isNaN(p2.fLoss2)?0:p2.fLoss2)+')/'+p2.sh2+' = '+p2.fLossMul2.toFixed(4));lines.push('  \u5355\u5f20\u4ef7: \xa5'+p2.fluteRaw2.toFixed(4)+' \xd7 '+p2.fLossMul2.toFixed(4)+' = \xa5'+p2.flutePerSheet2.toFixed(4)+'/\u5f20 \u2192 \xa5'+(p2.flutePerSheet2/p2.nUp2).toFixed(4)+'/\u4e2a');lines.push('  '+p2.sh2+'\u5f20 \u5c0f\u8ba1 \xa5'+p2.fluteTotal2.toFixed(2));lines.push('');}
    if(enPress){lines.push('\u3010\u5370\u52372\u3011'+pn2+' '+p2.front_cn+'\u8272');lines.push('  \u5171'+p2.sh2+'\u5f20 \u2192 \u5c0f\u8ba1 \xa5'+p2.pressTotal2.toFixed(2));lines.push('');}
    if(enSurface&&p2.surfaceCost2>0)lines.push('\u3010\u8868\u9762\u5904\u74062\u3011\xa5'+p2.surfaceCost2.toFixed(2));
    if(enMount)lines.push('\u3010\u88f1\u74e62\u3011\xa5'+PRICE.mount.toFixed(2)+'/\u33a1 \xd7 '+p2.pArea2.toFixed(4)+'\u33a1 \xd7 '+p2.sh2+'\u5f20 = \xa5'+p2.mountTotal2.toFixed(2));
    lines.push('\u3010\u5200\u72482\u3011\u65b0\u7248 \u9762\u79ef\xd7250');lines.push('  \u5200\u7248\u5c3a\u5bf8 '+p2.dL2+'\xd7'+p2.dW2+'mm = '+(p2.dL2*p2.dW2/1000000).toFixed(4)+'\u33a1 \xd7 250 = \xa5'+p2.dieFee2.toFixed(2));
    if(enDieCut)lines.push('\u3010\u6a21\u52072\u3011'+p2.dcKey2+' \u514d\u88c5\u7248 + \xa5'+p2.dc2_1+'/\u5f20\xd7'+p2.sh2+' = \xa5'+p2.dieCutCost2.toFixed(2));
    if(enGlue)lines.push('\u3010\u7c98\u76d22\u3011\xa5'+(PRICE.glue[glueKey]||0).toFixed(2)+'/\u4e2a \xd7 '+qty+'\u4e2a = \xa5'+p2.glueCost2.toFixed(2));
    delete window._piece2;
  }"""

c = c[:block_end] + piece2_bd + c[block_end:]

# === 7. Outsourcing ===
# Add PRICE.outsource
c = c.replace(
    'pressLimit: {"120":[104,75,50,45], "115×85":[115,85], "132×97":[132,97], "142×102":[142,102]}',
    'pressLimit: {"120":[104,75,50,45], "115×85":[115,85], "132×97":[132,97], "142×102":[142,102]},\n  outsource: {"1620\u4e94\u8272": {"4":[900,0.25], "5":[1300,0.30], "6":[1800,0.45]}}'
)

# Add outsourceEnabled checkbox in特殊设置
c = c.replace(
    '<label style="font-size:0.85rem;cursor:pointer;color:#8e44ad"><input type="checkbox" id="vipMode" onchange="checkPressLimit()" style="width:auto;height:auto;vertical-align:middle"> 大客户/代加工</label>\n    </div>',
    '<label style="font-size:0.85rem;cursor:pointer;color:#8e44ad"><input type="checkbox" id="vipMode" onchange="checkPressLimit()" style="width:auto;height:auto;vertical-align:middle"> 大客户/代加工</label>\n        <label style="font-size:0.85rem;cursor:pointer;color:#e74c3c"><input type="checkbox" id="outsourceEnabled" onchange="var oc=document.getElementById(\'outsourceCard\');oc.style.display=this.checked?\'\':\'none\';document.getElementById(\'chkPress\').checked=!this.checked" style="width:auto;height:auto;vertical-align:middle"> 外加工</label>\n    </div>'
)

# Add outsourceCard before其他
c = c.replace(
    '</div>\n</div>\n\n<div class="card">\n    <h2>\U0001f3a8 \u5176\u4ed6</h2>',
    '</div>\n</div>\n\n<div class="card" id="outsourceCard" style="display:none">\n    <h2 style="display:flex;align-items:center"><span>\U0001f3ed \u5916\u52a0\u5de5 <span id="outsourcePriceInfo" style="font-size:0.75rem;font-weight:normal;color:#555"></span></span></h2>\n    <div class="row">\n        <div class="field"><label>\u5916\u52a0\u5de5\u673a\u578b</label><select id="outsourceMachine" onchange="updateOutsource()"><option value="1620\u4e94\u8272" selected>1620\u4e94\u8272</option></select></div>\n        <div class="field"><label>\u8272\u6570</label><select id="outsourceColors" onchange="updateOutsource()"><option value="4" selected>4\u8272</option><option value="5">5\u8272</option><option value="6">6\u8272</option></select></div>\n        <div class="field"><label>\u8fd0\u8d39 (\u5143)</label><input type="number" id="outsourceFreight" value="0" step="1" style="font-size:0.82rem"></div>\n    </div>\n</div>\n\n<div class="card">\n    <h2>\U0001f3a8 \u5176\u4ed6</h2>'
)

# Add updateOutsource + outsource calc + breakdown
c = c.replace(
    'function toggleTwoPieceMode',
    'function updateOutsource(){\n  var m=document.getElementById(\'outsourceMachine\').value;\n  var cn=document.getElementById(\'outsourceColors\').value;\n  var tier=(PRICE.outsource[m]||{})[cn]||[0,0];\n  document.getElementById(\'outsourcePriceInfo\').innerHTML=\'| \u5f00\u673a<b>\xa5\'+tier[0]+\'</b> + \u8d85\u6570<b>\xa5\'+tier[1]+\'</b>/\u5f20\';\n}\nfunction toggleTwoPieceMode'
)

# Outsourcing calc
c = c.replace(
    'var pressTotal=enPress?colorCost*(qty/1000):0;\n\n    var extraUnitSel',
    'var pressTotal=enPress?colorCost*(qty/1000):0;\n\n  // 外加工\n  var outsourceCost=0;\n  if(document.getElementById(\'outsourceEnabled\').checked){\n    var ocn=document.getElementById(\'outsourceColors\').value;\n    var oMachine=document.getElementById(\'outsourceMachine\').value;\n    var oTier=(PRICE.outsource[oMachine]||{})[ocn]||[0,0];\n    var oBase=oTier[0],oOver=oTier[1];\n    outsourceCost=(totalSheets<=3000?oBase:totalSheets<=10000?oBase+oOver*(totalSheets-3000):oOver*totalSheets);\n    if(dualSide)outsourceCost*=2;\n    outsourceCost+=parseFloat(document.getElementById(\'outsourceFreight\').value)||0;\n    updateOutsource();\n  }\n\n    var extraUnitSel'
)

# Add to allCost
c = c.replace(
    'surfaceCost+extraCost;',
    'surfaceCost+outsourceCost+extraCost;'
)

# Add to window._costs
c = c.replace(
    'tsKey:tsKey,tsPrice:tsPrice,',
    'tsKey:tsKey,tsPrice:tsPrice,\n    outsourceCost:outsourceCost,'
)

# Add to breakdown
c = c.replace(
    "// 运输\n  if(!enTransport){lines.push('\u3010\u8fd0\u8f93\u3011\u5df2\u8df3\u8fc7');}",
    "// 外加工\n  if(document.getElementById('outsourceEnabled').checked){var oFreight=parseFloat(document.getElementById('outsourceFreight').value)||0;lines.push('\u3010\u5916\u52a0\u5de5\u3011'+oMachine+' '+ocn+'\u8272 \u5171'+totalSheets+'\u5f20 \u2192 '+(totalSheets<=3000?'\u22643k \u5f00\u673a\xa5'+oBase:totalSheets<=10000?'\u5f00\u673a\xa5'+oBase+' + \xa5'+oOver+'/\u5f20\xd7'+(totalSheets-3000):'\u8d851\u4e07 \xa5'+oOver+'/\u5f20\xd7'+totalSheets)+' = \xa5'+(outsourceCost-oFreight).toFixed(0)+(dualSide?' \xd72(\u53cc\u9762)':'')+(oFreight>0?' + \u8fd0\u8d39\xa5'+oFreight:''));lines.push('');}else{lines.push('');}\n  // 运输\n  if(!enTransport){lines.push('\u3010\u8fd0\u8f93\u3011\u5df2\u8df3\u8fc7');}"

# Save twoPiece + outsource to saveQuote
c = c.replace(
    "r.colorsBack=dualSide?document.getElementById('colorsBack').value:null;",
    "r.colorsBack=dualSide?document.getElementById('colorsBack').value:null;r.twoPiece=document.getElementById('twoPiece').checked;r.twoPieceMode=document.querySelector('input[name=\"twoPieceMode\"]:checked')?document.querySelector('input[name=\"twoPieceMode\"]:checked').value:null;r.outsourceCost=outsourceCost;"
)

c = re.sub(r"2026\.\d{2}\.\d{2} \d{2}:\d{2}", ts, c)
with open(fpath, "w", encoding="utf-8") as f:
    f.write(c)
print("Features 6-7 done")
