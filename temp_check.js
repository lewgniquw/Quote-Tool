var PRICE = {
  surfaceFilm: {"亮膜":0.30,"哑膜":0.35,"亮油":0.20,"哑油":0.28,"UV油":0.45,"大面积烫金/银":3,"防刮膜":0.80},
  surfaceK: {"烫金/银":0.30,"凹凸":0.25,"压纹":0.15},
  embossFee: 100,
  pressLimit: {"120":[104,75,50,45],"115×85":[115,85],"132×97":[132,97],"142×102":[142,102]},
  press120: {"4":[350,0.07],"5":[550,0.11]},
  press142: {"115×85":{"4":[520,0.11],"5":[800,0.14]},"132×97":{"4":[650,0.16],"5":[900,0.22]},"142×102":{"4":[750,0.22],"5":[1150,0.27]}},
  mount: 0.20,
  dieCut: {"930手动":[35,0.08],"1100手动":[35,0.10],"1300自动":[40,0.12],"1500自动":[50,0.20],"1800手动":[50,0.30]},
  glue: {"卡盒 糊口<20":0.03,"卡盒 展开>80":0.05,"瓦楞 糊口<20":0.05,"瓦楞 糊口20~30":0.065,"瓦楞 糊口>30":0.08,"瓦楞 长>60":0.13,"瓦楞 长>80":0.16},
  transport: {"庆元":0.12,"龙泉":0.08,"政和":0.15,"建瓯":0.25,"景宁":0.15,"丽水":0.18,"松阳":0.25,"无需物流":0,"0.3":0.3,"0.35":0.35},
  dieCutLimit: {"930手动":[90,64],"1100手动":[107,76],"1300自动":[127,97],"1500自动":[147,107],"1800手动":[178,126]}
};
// 从 localStorage 恢复设置价格
(function(){
  try{
    var s=JSON.parse(localStorage.getItem('priceSettings'));
    if(!s)return;
    if(s.surfaceFilm)Object.keys(s.surfaceFilm).forEach(function(k){PRICE.surfaceFilm[k]=s.surfaceFilm[k];});
    if(s.surfaceK)Object.keys(s.surfaceK).forEach(function(k){PRICE.surfaceK[k]=s.surfaceK[k];});
    if(s.press120)Object.keys(s.press120).forEach(function(k){PRICE.press120[k]=s.press120[k];});
    if(s.press142)Object.keys(s.press142).forEach(function(k){PRICE.press142[k]=s.press142[k];});
    if(s.mount!==undefined)PRICE.mount=s.mount;
    if(s.dieCut)Object.keys(s.dieCut).forEach(function(k){PRICE.dieCut[k]=s.dieCut[k];});
    if(s.glue)Object.keys(s.glue).forEach(function(k){PRICE.glue[k]=s.glue[k];});
    if(s.transport)Object.keys(s.transport).forEach(function(k){PRICE.transport[k]=s.transport[k];});
  }catch(e){}
})();
var SET_PWD='+987';

function calcMount(){var pL=parseFloat(document.getElementById('dieL').value)||0,pW=parseFloat(document.getElementById('dieW').value)||0;if(!pL||!pW){document.getElementById('mountDisplay').value='--';return 0;}var cutL=pL+20,cutW=pW+20;cutW=Math.ceil(cutW/50)*50;var area=cutL*cutW/1000000;var perSheet=area*PRICE.mount;document.getElementById('mountDisplay').value='¥'+perSheet.toFixed(4)+'/张 ('+(cutL*cutW).toFixed(0)+'mm²)';return perSheet;}

function checkPressLimit(){
  var pLmm=parseFloat(document.getElementById('dieL').value)||0,pWmm=parseFloat(document.getElementById('dieW').value)||0;
  var cutWmm=pWmm+20;cutWmm=Math.ceil(cutWmm/5)*5;
  var pL=(pLmm+20)/10,pW=cutWmm/10;
  var mKey=document.getElementById('pressMachine').value;
  if(mKey==='120'){
    var lim=PRICE.pressLimit['120']||[999,999,0,0];
    var ok=(pL>=lim[2]&&pL<=lim[0]&&pW>=lim[3]&&pW<=lim[1])||(pW>=lim[2]&&pW<=lim[0]&&pL>=lim[3]&&pL<=lim[1]);
    var el=document.getElementById('pressLimit'),warn=document.getElementById('pressWarning');
    el.textContent='| 最大 '+lim[0]+'×'+lim[1]+'cm 最小 '+lim[2]+'×'+lim[3]+'cm';
    if(ok){warn.style.display='none';el.style.color='#27ae60';}else{warn.style.display='block';warn.textContent='⚠ 裁切尺寸超出该机型范围！';el.style.color='#e74c3c';}
    calcPressCost();return ok;
  }else{
    if(!pLmm||!pWmm){document.getElementById('pressLimit').textContent='';return true;}
    var vip=document.getElementById('vipMode').checked;
    var best='142×102';
    if(vip){var sizes=['115×85','132×97','142×102'];for(var i=0;i<sizes.length;i++){var L=PRICE.pressLimit[sizes[i]];if((pL<=L[0]&&pW<=L[1])||(pW<=L[0]&&pL<=L[1])){best=sizes[i];break;}}}
    var cn_=document.getElementById('colors').value;var T=PRICE.press142[best][cn_];
    document.getElementById('pressLimit').innerHTML='| '+(vip?'版纸: ':'固定 ')+'<b>'+best+'</b> | 开机<b>¥'+T[0]+'</b> + 超数×<b>¥'+T[1]+'</b>';
    document.getElementById('pressLimit').style.color='#27ae60';document.getElementById('pressLimit').style.fontWeight='bold';
    document.getElementById('pressWarning').style.display='none';
    document.getElementById('pressMachine').dataset.plate=best;
    calcPressCost();return true;
  }
}


function updateDimensions(){
  var pL=parseFloat(document.getElementById('dieL').value)||0,pW=parseFloat(document.getElementById('dieW').value)||0;
  if(!pL||!pW){document.getElementById('cutSizeL').value='--';document.getElementById('cutSizeW').value='--';document.getElementById('fluteLDisp').value='--';document.getElementById('fluteWDisp').value='--';return;}
  // 裁纸: 刀版+20mm, 宽向上凑整5cm
  var cutL=pL+20,cutW=pW+20;
  cutW=Math.ceil(cutW/50)*50;
  document.getElementById('cutSizeL').value=cutL.toFixed(0);
  document.getElementById('cutSizeW').value=cutW.toFixed(0)+' (凑整)';
  // 浪纸: 刀版+10mm(长), 刀版+30mm(宽)
  var fluteL=pL+10,fluteW=pW+30;
  document.getElementById('fluteLDisp').value=fluteL.toFixed(0);
  document.getElementById('fluteWDisp').value=fluteW.toFixed(0)+' (+20mm)';
  calcMount();checkPressLimit();suggestDieCut();
}
function suggestDieCut(){
  var pL=parseFloat(document.getElementById('dieL').value)||0,pW=parseFloat(document.getElementById('dieW').value)||0;
  if(!pL||!pW){var sp2=document.getElementById('dieCutSugg');sp2.textContent='';sp2.style.border='none';sp2.style.padding='0';return;}
  var cmL=pL/10,cmW=pW/10;
  var best=null;
  Object.keys(PRICE.dieCutLimit).forEach(function(k){
    var lim=PRICE.dieCutLimit[k];
    if((cmL<=lim[0]&&cmW<=lim[1]||cmW<=lim[0]&&cmL<=lim[1])&&!best)best=k;
  });
  var sp=document.getElementById('dieCutSugg');
  if(best){sp.textContent=' → 建议: '+best;sp.style.border='1.5px solid #27ae60';sp.style.borderRadius='3px';sp.style.padding='1px 6px';}
  else{sp.textContent='';sp.style.border='none';sp.style.padding='0';}
}
function calcPressCost(){
  var mKey=document.getElementById('pressMachine').value,cn=document.getElementById('colors').value;
  var press,tier;
  if(mKey==='120'){press=PRICE.press120;tier=press[cn]||[0,0];}
  else{var plate=document.getElementById('pressMachine').dataset.plate||'142×102';press=PRICE.press142[plate];tier=press[cn]||[0,0];}
  var nUp=parseInt(document.getElementById('piecesPerSheet').value)||1;
  var qty=parseInt(document.getElementById('quantity').value)||0;
  var totalSheets=qty>0?Math.ceil(qty/nUp):(nUp?Math.ceil(1000/nUp):1000);
  var base=tier[0],overflow=tier[1];
  var waive=document.getElementById('waivePressBase').checked;
  var totalCost=waive?overflow*totalSheets:(totalSheets<=3000?base:base+overflow*(totalSheets-3000));
  var costPerK=totalCost/((qty>0?qty:1000)/1000);
  var perSheet=totalCost/totalSheets;
  document.getElementById('pressCostDisplay').value=(waive?'[免开机] ':'')+'单价¥'+perSheet.toFixed(4)+'/张 × '+totalSheets+'张 = ¥'+totalCost.toFixed(0);
  return costPerK;
}

function calculate(){
  var enPaper=document.getElementById('chkPaper').checked;
  var enFlute=document.getElementById('chkFlute').checked;
  var enPress=document.getElementById('chkPress').checked;
  var enMount=document.getElementById('chkMount').checked;
  var enDieCut=document.getElementById('chkDieCut').checked;
  var enGlue=document.getElementById('chkGlue').checked;
  var enSurface=document.getElementById('chkSurface').checked;
  var enTransport=document.getElementById('chkTransport').checked;
  if(enPaper){
    if(!document.getElementById('dieL').value){alert('请填写刀版长');return;}
    if(!document.getElementById('dieW').value){alert('请填写刀版宽');return;}
    if(!document.getElementById('paperGram').value){alert('请填写面纸克重');return;}
    if(!document.getElementById('paperTon').value){alert('请填写面纸吨价');return;}
  }
  var pL=parseFloat(document.getElementById('dieL').value)||0,pW=parseFloat(document.getElementById('dieW').value)||0;
  var gram=parseInt(document.getElementById('paperGram').value)||0;
  var tonPrice=parseFloat(document.getElementById('paperTon').value)||0;
  var nUp=parseInt(document.getElementById('piecesPerSheet').value)||1;
  // 裁纸尺寸: 刀版+20mm, 宽凑整5cm
  var cutL=pL+20,cutW=pW+20;
  cutW=Math.ceil(cutW/50)*50;
  // 浪纸尺寸: 刀版+10mm(长), 刀版+30mm(宽)
  var fL=pL+10,fW=pW+30;
  var fPrice=parseFloat(document.getElementById('flutePrice').value)||0;
  if(enFlute){
    if(!pL||!pW){alert('请填写刀版尺寸');return;}
    if(!fPrice){alert('请填写浪纸单价');return;}
  }
  if(!document.getElementById('quantity').value){alert('请填写数量');return;}
  var qty=parseInt(document.getElementById('quantity').value);
  var sheetsPerK=1000/nUp;
  var totalSheets=Math.ceil(qty/nUp);

  // 损耗：面纸默认5%或固定张数，浪纸默认3%或固定张数
  var pLoss=parseFloat(document.getElementById('paperLoss').value);
  var fLoss=parseFloat(document.getElementById('fluteLoss').value);
  var pLossMul = isNaN(pLoss)||pLoss===0 ? 1.05 : (totalSheets+pLoss)/totalSheets;
  var fLossMul = isNaN(fLoss)||fLoss===0 ? 1.03 : (totalSheets+fLoss)/totalSheets;

  var pArea=cutL*cutW/1000000;
  var areaPerTon=1000000/gram;
  var pricePerM2=tonPrice/areaPerTon;
  var paperRaw=pricePerM2*pArea;
  var paperPerSheet=paperRaw*pLossMul;

  // 浪纸计价面积 = 长 × 宽
  var fArea=fL*fW/1000000;
  var fluteRaw=fPrice*fArea;
  var flutePerSheet=fluteRaw*fLossMul;

  var mountCost=calcMount();
  var mountPerK=mountCost*sheetsPerK;

  var dcKey=document.getElementById('dieCutMachine').value;
  var dc=PRICE.dieCut[dcKey]||[0,0];
  var dieCutCost=enDieCut?((document.getElementById('waiveDieSetup').checked?0:dc[0])+dc[1]*totalSheets):0;

  var glueKey=document.getElementById('glueBox').value;
  var glueCost=enGlue?(PRICE.glue[glueKey]||0)*qty:0;

  // 运输按面纸面积（每盒面积）
  var tsKey=document.getElementById('transport').value;
  var tsCost=enTransport?(PRICE.transport[tsKey]||0)*pArea*totalSheets:0;

  // 刀版费：长宽=浪纸各-1cm，新版=面积×250，旧版=0
  var isNewDie=parseInt(document.getElementById('dieNew').value)||0;
  var dieArea=pL*pW/1000000;
  var dieFee=isNewDie?dieArea*250:0;

  var filmArea=pArea;
  var checks=document.querySelectorAll('#surfaceGroup input:checked'),surfaceList=[],surfaceCost=0;
  if(!enSurface){checks=[];surfaceCost=0;}
  checks.forEach(function(c){
    surfaceList.push(c.value);
    if(PRICE.surfaceFilm[c.value]!==undefined) surfaceCost+=PRICE.surfaceFilm[c.value]*filmArea*totalSheets;
    else {
      surfaceCost+=PRICE.surfaceK[c.value]*qty;
      if(c.value==='压纹') surfaceCost+=PRICE.embossFee;
    }
  });

  var cn=document.getElementById('colors').value;
  var colorCost=calcPressCost();
  var marginPct=parseInt(document.getElementById('marginPct').value);if(isNaN(marginPct))marginPct=20;
  var taxVal=document.getElementById('taxRate').value;
  var taxPct=taxVal===''?13:parseInt(taxVal)||0;
  var margin=marginPct/100,tax=taxPct/100;

  // 各分项总价
  var paperTotal=enPaper?paperPerSheet*totalSheets:0;
  var fluteTotal=enFlute?flutePerSheet*totalSheets:0;
  var mountTotal=enMount?mountCost*totalSheets:0;
  var pressTotal=enPress?colorCost*(qty/1000):0;

    var extraUnitSel=document.getElementById('extraCostUnit');var extraUnit=extraUnitSel.options[extraUnitSel.selectedIndex].text;
  var extraVal=parseFloat(document.getElementById('extraCost').value)||0;
  var extraArea=pArea||0;if(!extraArea){extraArea=(fL||0)*(fW||0)/1000000;};var extraCost=extraUnit==='元/个'?extraVal*qty:extraUnit==='元/㎡'?extraVal*extraArea*totalSheets:extraVal;
  window._costs={
    paper:paperTotal,flute:fluteTotal,press:pressTotal,mount:mountTotal,
    dieCut:dieCutCost,glue:glueCost,die:dieFee,transport:tsCost,
    surface:surfaceCost,extra:extraCost,
    gram:gram,ton:tonPrice,fPrice:fPrice,mountPrice:PRICE.mount,
    dcKey:dcKey,glueKey:glueKey,gluePrice:PRICE.glue[glueKey]||0,
    tsKey:tsKey,tsPrice:PRICE.transport[tsKey]||0
  };
  var allCost=paperTotal+fluteTotal+pressTotal+mountTotal+dieCutCost+glueCost+dieFee+tsCost+surfaceCost+extraCost;
  var cpu=allCost/qty;
  var taxPrice=cpu*(1+tax);
  var sp=taxPrice/(1-margin);
  var total=sp*qty;

  document.getElementById('result').style.display='block';document.getElementById('btnExport').style.display='block';document.getElementById('btnSave').style.display='block';
  document.getElementById('totalPrice').textContent='¥ '+total.toFixed(2);
  document.getElementById('unitPrice').textContent='单价 ¥ '+sp.toFixed(4)+'/个（含税'+(tax*100).toFixed(0)+'% 毛利率'+(margin*100).toFixed(0)+'%）';

  var lines=[];
// 面纸
  if(!enPaper){lines.push('【面纸】已跳过');}
  else{
  lines.push('【面纸】'+gram+'g 吨价¥'+tonPrice);
  lines.push('  平方单价: ¥'+pricePerM2.toFixed(4)+'/㎡');
  lines.push('  刀版: '+pL.toFixed(0)+'×'+pW.toFixed(0)+'mm → 裁切: '+cutL.toFixed(0)+'×'+cutW.toFixed(0)+'mm = '+pArea.toFixed(4)+'㎡ × ¥'+pricePerM2.toFixed(4)+' = ¥'+paperRaw.toFixed(4));
  if(!isNaN(pLoss)&&pLoss>0) lines.push('  损耗: ('+totalSheets+'+'+pLoss+')/'+totalSheets+' = '+pLossMul.toFixed(4));
  else lines.push('  损耗: 默认5% = '+pLossMul.toFixed(4));
  lines.push('  单张价: ¥'+paperRaw.toFixed(4)+' × '+pLossMul.toFixed(4)+' = ¥'+paperPerSheet.toFixed(4)+'/张 → ¥'+(paperPerSheet/nUp).toFixed(4)+'/个');
  lines.push('  '+totalSheets+'张 小计 ¥'+paperTotal.toFixed(2));
  lines.push('');
  }
  // 浪纸
  if(!enFlute){lines.push('【浪纸】已跳过');lines.push('');}
  else{
  lines.push('【浪纸】¥'+fPrice.toFixed(2)+'/㎡');
  lines.push('  刀版: '+pL.toFixed(0)+'×'+pW.toFixed(0)+'mm → 浪纸: '+fL.toFixed(0)+'×'+fW.toFixed(0)+'mm (+1cm/+3cm) = '+fArea.toFixed(4)+'㎡ × ¥'+fPrice.toFixed(2)+' = ¥'+fluteRaw.toFixed(4));
  if(!isNaN(fLoss)&&fLoss>0) lines.push('  损耗: ('+totalSheets+'+'+fLoss+')/'+totalSheets+' = '+fLossMul.toFixed(4));
  else lines.push('  损耗: 默认3% = '+fLossMul.toFixed(4));
  lines.push('  单张价: ¥'+fluteRaw.toFixed(4)+' × '+fLossMul.toFixed(4)+' = ¥'+flutePerSheet.toFixed(4)+'/张 → ¥'+(flutePerSheet/nUp).toFixed(4)+'/个');
  lines.push('  '+totalSheets+'张 小计 ¥'+fluteTotal.toFixed(2));
  lines.push('');
  }
  // 印刷
  if(!enPress){lines.push('【印刷】已跳过');lines.push('');}
  else{
  lines.push('【印刷】'+(document.getElementById('pressMachine').value==='120'?'120':'142 '+(document.getElementById('pressMachine').dataset.plate||'142×102'))+' '+cn+'色');
  var pressKey=document.getElementById('pressMachine').value,pressTier;
  if(pressKey==='120')pressTier=PRICE.press120[cn];else{var bp=document.getElementById('pressMachine').dataset.plate||'142×102';pressTier=(PRICE.press142[bp]||{})[cn]||[0,0];}
  var wbd=document.getElementById('waivePressBase').checked;lines.push('  共'+totalSheets+'张 → '+ (wbd?'免开机费 ¥'+pressTier[1]+'/张×'+totalSheets:(totalSheets<=3000?'≤3k 开机费¥'+pressTier[0]:'开机¥'+pressTier[0]+' + ¥'+pressTier[1]+'/张×'+(totalSheets-3000))));
  lines.push('  小计 ¥'+pressTotal.toFixed(2)+' → ¥'+(pressTotal/totalSheets).toFixed(4)+'/张 → ¥'+(pressTotal/qty).toFixed(4)+'/个');
  lines.push('');
  }
  // 表面处理
  if(!enSurface){lines.push('【表面处理】已跳过');}
  else if(surfaceList.length){
    lines.push('【表面处理】');
    checks.forEach(function(c){
      if(PRICE.surfaceFilm[c.value]!==undefined){
        var sc=PRICE.surfaceFilm[c.value]*filmArea*totalSheets;
        lines.push('  '+c.value+' ¥'+PRICE.surfaceFilm[c.value].toFixed(2)+'/㎡ × '+filmArea.toFixed(4)+'㎡ × '+totalSheets+'张 = ¥'+sc.toFixed(2)+' → ¥'+(sc/totalSheets).toFixed(4)+'/张 → ¥'+(sc/qty).toFixed(4)+'/个');
      }else{
        var sc=PRICE.surfaceK[c.value]*qty;
        var extra=(c.value==='压纹'?' + 上机¥'+PRICE.embossFee:'');
        lines.push('  '+c.value+' ¥'+PRICE.surfaceK[c.value].toFixed(2)+'/张 × '+qty+'个'+extra+' = ¥'+(sc+(c.value==='压纹'?PRICE.embossFee:0)).toFixed(2)+' → ¥'+((sc+(c.value==='压纹'?PRICE.embossFee:0))/qty).toFixed(4)+'/个');
      }
    });
    lines.push('');
  }// 裱瓦
  if(!enMount){lines.push('【裱瓦】已跳过');}
  else{lines.push('【裱瓦】¥'+PRICE.mount.toFixed(2)+'/㎡ × '+pArea.toFixed(4)+'㎡ × '+totalSheets+'张 = ¥'+mountTotal.toFixed(2)+' → ¥'+mountCost.toFixed(4)+'/张 → ¥'+(mountCost/nUp).toFixed(4)+'/个');}
  lines.push('');
  lines.push('【刀版】'+(isNewDie?'新版 面积×250':'旧版免费'));
  if(isNewDie) lines.push('  刀版尺寸 '+pL.toFixed(0)+'×'+pW.toFixed(0)+'mm = '+dieArea.toFixed(4)+'㎡ × 250 = ¥'+dieFee.toFixed(2)+' → ¥'+(dieFee/totalSheets).toFixed(4)+'/张 → ¥'+(dieFee/qty).toFixed(4)+'/个');
  lines.push('');
  // 模切
  if(!enDieCut){lines.push('【模切】已跳过');}
  else{lines.push('【模切】'+dcKey+(document.getElementById('waiveDieSetup').checked?' 免装版':' 装版¥'+dc[0])+' + ¥'+dc[1]+'/张×'+totalSheets+' = ¥'+dieCutCost.toFixed(2)+' → ¥'+(dieCutCost/totalSheets).toFixed(4)+'/张 → ¥'+(dieCutCost/qty).toFixed(4)+'/个');}
  lines.push('');
  // 粘盒
  if(!enGlue){lines.push('【粘盒】已跳过');}
  else{lines.push('【粘盒】¥'+(PRICE.glue[glueKey]||0).toFixed(2)+'/个 × '+qty+'个 = ¥'+glueCost.toFixed(2));}
  lines.push('');
  // 运输
  if(!enTransport){lines.push('【运输】已跳过');lines.push('');}
  else{
  lines.push('【运输】'+tsKey+' ¥'+(PRICE.transport[tsKey]||0).toFixed(2)+'/㎡ (按面纸面积)');
  lines.push('  '+pArea.toFixed(4)+'㎡ × ¥'+(PRICE.transport[tsKey]||0).toFixed(2)+' × '+totalSheets+'张 = ¥'+tsCost.toFixed(2)+' → ¥'+(tsCost/totalSheets).toFixed(4)+'/张 → ¥'+(tsCost/qty).toFixed(4)+'/个');
  lines.push('');
  }
  // 其他成本
  if(extraCost>0){
    if(extraUnit==='元/个'){
    lines.push('【其他成本】¥'+extraVal.toFixed(4)+'/个 × '+qty+'个 = ¥'+extraCost.toFixed(2)+' → ¥'+(extraCost/totalSheets).toFixed(4)+'/张 → ¥'+extraVal.toFixed(4)+'/个');
  }else if(extraUnit==='元/㎡'){
    lines.push('【其他成本】¥'+extraVal.toFixed(2)+'/㎡ × '+extraArea.toFixed(4)+'㎡ × '+totalSheets+'张 = ¥'+extraCost.toFixed(2)+' → ¥'+(extraCost/totalSheets).toFixed(4)+'/张 → ¥'+(extraCost/qty).toFixed(4)+'/个');
  }else{
    lines.push('【其他成本】总价 ¥'+extraCost.toFixed(2)+' → ¥'+(extraCost/qty).toFixed(4)+'/个');
  }
    lines.push('');
  }
  
  lines.push('<hr>');
  lines.push('<span style="word-break:break-all">面纸 ¥'+paperTotal.toFixed(2)+' + 浪纸 ¥'+fluteTotal.toFixed(2)+' + 印刷 ¥'+pressTotal.toFixed(2)+' + 表面 ¥'+surfaceCost.toFixed(2)+' + 裱瓦 ¥'+mountTotal.toFixed(2)+' + 刀版 ¥'+dieFee.toFixed(2)+' + 模切 ¥'+dieCutCost.toFixed(2)+' + 粘盒 ¥'+glueCost.toFixed(2)+' + 运输 ¥'+tsCost.toFixed(2)+' + 其他 ¥'+extraCost.toFixed(2)+' = <b>合计 ¥'+allCost.toFixed(2)+'</b></span>');
  lines.push('<hr>');
  lines.push('成本价 ¥'+cpu.toFixed(4)+'/个 (¥'+allCost.toFixed(2)+' ÷ '+qty+'个)');
  lines.push('含税价 ¥'+taxPrice.toFixed(4)+'/个 (¥'+cpu.toFixed(4)+' × '+(1+tax).toFixed(2)+')');
  lines.push('含毛利 ¥'+sp.toFixed(4)+'/个 (¥'+taxPrice.toFixed(4)+' ÷ '+(1-margin).toFixed(2)+')');
  lines.push('总价 ¥'+total.toFixed(2)+' ('+qty+'个)');
  document.getElementById('breakdown').innerHTML=lines.join('<br>');
}

onSurfaceChange=function(){
  var c=document.querySelectorAll('#surfaceGroup input');
  var film=0,oil=0,foil=0;
  c.forEach(function(x){
    if(!x.checked)return;
    if(x.value==='亮膜'||x.value==='哑膜')film++;
    if(x.value==='亮油'||x.value==='哑油'||x.value==='UV油')oil++;
    if(x.value==='烫金/银'||x.value==='大面积烫金/银')foil++;
  });
  document.getElementById('warnFilm').style.display=film>1?'inline':'none';
  document.getElementById('warnOil').style.display=oil>1?'inline':'none';
  document.getElementById('warnFoil').style.display=foil>1?'inline':'none';
};
adjInput=function(id,d,min,max){var el=document.getElementById(id);var v=parseInt(el.value)||0;v+=d;if(min!==undefined&&v<min)v=min;if(max!==undefined&&v>max)v=max;el.value=v;};
adjMargin=function(d){var el=document.getElementById('marginPct');var v=parseInt(el.value);if(isNaN(v))v=15;v+=d;if(v<0)v=0;if(v>200)v=200;el.value=v;};

document.getElementById('dieL').addEventListener('input',function(){updateDimensions();calcPressCost();});
document.getElementById('dieW').addEventListener('input',function(){updateDimensions();calcPressCost();});
document.getElementById('pressMachine').addEventListener('change',checkPressLimit);
document.getElementById('colors').addEventListener('change',calcPressCost);document.getElementById('colors').addEventListener('change',checkPressLimit);
document.getElementById('piecesPerSheet').addEventListener('input',function(){calcPressCost();calcMount();});
document.getElementById('quantity').addEventListener('input',calcPressCost);
calcMount();
checkPressLimit();
document.querySelectorAll('#surfaceGroup input').forEach(function(el){el.addEventListener('change',onSurfaceChange);});

showPwd=function(){document.getElementById('pwdOverlay').classList.add('show');document.getElementById('pwdInput').focus();};
checkPwd=function(){if(document.getElementById('pwdInput').value===SET_PWD){document.getElementById('pwdOverlay').classList.remove('show');openSettings();}else{document.getElementById('pwdError').style.display='block';}};


function exportXLS(){
  var C=window._costs||{};
  var qty=parseInt(document.getElementById('quantity').value)||0;
  var dieL=document.getElementById('dieL').value||'',dieW=document.getElementById('dieW').value||'';
  var nUp=document.getElementById('piecesPerSheet').value||1;
  var cutL=document.getElementById('cutSizeL').value||'',cutW=(document.getElementById('cutSizeW').value||'').replace(/ \(.+?\)/,'');
  var fL=document.getElementById('fluteLDisp').value||'',fW=(document.getElementById('fluteWDisp').value||'').replace(/ \(.+?\)/,'');
  var pressKey=document.getElementById('pressMachine').value;
  var pressName=pressKey==='120'?'120对开机':'142全开机';
  var colors=document.getElementById('colors').value;
  var date=new Date().toLocaleDateString('zh-CN');
  
  // Cost rows from global data
  var costRows=[];
  var items=[
    {key:'paper',name:'面纸',desc:(C.gram||'')+'g '+(C.ton||'')+'/t'},
    {key:'flute',name:'浪纸',desc:(C.fPrice||'')+'/'+String.fromCharCode(13217)},
    {key:'press',name:'印刷',desc:pressName+' '+colors+'色'},
    {key:'surface',name:'表面处理',desc:(function(){
    var sel=[];document.querySelectorAll('#surfaceGroup input:checked').forEach(function(c){sel.push(c.value);});
    return sel.length?sel.join('+'):'';
  })()},
    {key:'mount',name:'裱瓦',desc:(C.mountPrice||'')+'/'+String.fromCharCode(13217)},
    {key:'die',name:'刀版',desc:'新版x250'},
    {key:'dieCut',name:'模切',desc:C.dcKey||''},
    {key:'glue',name:'粘盒',desc:(C.gluePrice||'')+'/'+String.fromCharCode(20010)},
    {key:'transport',name:'运输',desc:(C.tsKey||'')+' '+(C.tsPrice||'')+'/'+String.fromCharCode(13217)},
    {key:'extra',name:'其他成本',desc:(function(){var u=document.getElementById('extraCostUnit');return u.options[u.selectedIndex].text;})()}
  ];
  var totalCost=0;
  items.forEach(function(it){
    var v=C[it.key]||0;
    if(v>0){
      var label=it.name+(it.desc?'-'+it.desc:'');
      costRows.push({name:label,val:v});
      totalCost+=v;
    }
  });

  var singleCost=totalCost/qty;
  var taxPrice=singleCost*1.07;
  var marginPrice=taxPrice/0.85;
  var taxRate=document.getElementById('taxRate').value||7;
  var marginRate=document.getElementById('marginPct').value||0;

  var l='<td class="xl70" height="22" style="height:22px">';
  var r='<td class="xl72" height="22" style="height:22px" x:num>';
  var st=' style="height:22px"';

  var body='<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><meta charset="UTF-8"><style>.xl68{color:#FFF;font-size:14px;font-weight:700;text-align:center;background:#2F5496;border:.5pt solid #000;padding:6px}.xl70{font-size:11px;font-weight:700;color:#333;border:.5pt solid #000;padding:4px 8px;background:#F2F2F2}.xl72{font-size:11px;text-align:right;border:.5pt solid #000;padding:4px 8px}.xl73{color:#FFF;font-size:11px;font-weight:700;text-align:center;background:#2F5496;border:.5pt solid #000;padding:4px}.xl77{font-size:12px;font-weight:700;text-align:right;border:.5pt solid #000;padding:4px 8px}tr{height:22px}';
  body+='</style></head><body><table border="1" style="border-collapse:collapse">';
  body+='<tr><td class="xl68" colspan="2" height="28">浙江国立包装有限公司 · 彩盒报价表</td></tr>';
  body+='<tr'+st+'>'+l+'日期</td><td class="xl72">'+date+'</td></tr>';
  body+='<tr'+st+'>'+l+'数量</td>'+r+qty+'</td></tr>';
  body+='<tr'+st+'>'+l+'刀版尺寸</td><td class="xl72">'+dieL+' × '+dieW+' mm</td></tr>';
  body+='<tr'+st+'>'+l+'裁切尺寸 (凑整)</td><td class="xl72">'+cutL+' × '+cutW+' mm</td></tr>';
  body+='<tr'+st+'>'+l+'浪纸尺寸 (+20mm)</td><td class="xl72">'+fL+' × '+fW+' mm</td></tr>';
  body+='<tr'+st+'>'+l+'拼版数</td>'+r+nUp+'</td></tr>';
  body+='<tr><td class="xl73" colspan="2" height="24">成本明细</td></tr>';
  body+='<tr'+st+'>'+l+'工序</td><td class="xl70" style="text-align:right">小计 (元)</td></tr>';
  for(var i=0;i<costRows.length;i++){
    body+='<tr'+st+'>'+l+costRows[i].name+'</td>'+r+costRows[i].val.toFixed(4)+'</td></tr>';
  }
  var startRow=10;
  var endRow=9+costRows.length;
  body+='<tr><td class="xl73" colspan="2" height="24">报价汇总</td></tr>';
  body+='<tr'+st+'>'+l+'总价</td><td class="xl77" x:fmla="=SUM(B'+startRow+':B'+endRow+')" x:num="'+totalCost.toFixed(4)+'">¥'+totalCost.toFixed(2)+'</td></tr>';
  body+='<tr'+st+'>'+l+'单个成本</td><td class="xl77" x:fmla="=B'+(endRow+2)+'/B3" x:num="'+singleCost.toFixed(4)+'">¥'+singleCost.toFixed(2)+'</td></tr>';
  body+='<tr'+st+'>'+l+'含税'+taxRate+'%</td><td class="xl77" x:fmla="=B'+(endRow+3)+'*(1+'+taxRate+'/100)" x:num="'+taxPrice.toFixed(4)+'">¥'+taxPrice.toFixed(2)+'</td></tr>';
  body+='<tr'+st+'>'+l+'毛利'+marginRate+'%</td><td class="xl77" x:fmla="=B'+(endRow+4)+'/(1-'+marginRate+'/100)" x:num="'+marginPrice.toFixed(4)+'">¥'+marginPrice.toFixed(2)+'</td></tr>';
  body+='</table></body></html>';

  var blob=new Blob([body],{type:'application/vnd.ms-excel;charset=utf-8'});
  var a=document.createElement('a');
  a.href=URL.createObjectURL(blob);
  a.download='报价表_'+new Date().toISOString().slice(0,10)+'.xls';
  a.click();
}

function openSettings(){
  function sf(k,v,u,s){return'<div class="srow"><label>'+k+'</label><input type="number" value="'+v+'" step="'+s+'" data-cat="'+k+'" data-unit="'+u+'"><span class="unit">'+u+'</span></div>';}
  document.getElementById('setSurfaceFilm').innerHTML=Object.keys(PRICE.surfaceFilm).map(function(k){return sf(k,PRICE.surfaceFilm[k],'元/㎡','0.01');}).join('');
  document.getElementById('setSurfaceK').innerHTML=Object.keys(PRICE.surfaceK).map(function(k){return sf(k,PRICE.surfaceK[k],'元/张','0.01');}).join('');
  document.getElementById('setPress120').innerHTML=Object.keys(PRICE.press120).map(function(k){var v=PRICE.press120[k];return'<div class="srow"><label>'+k+'色</label><span>开机</span><input type="number" value="'+v[0]+'" step="1" data-cat="press120-'+k+'" data-field="0"><span>超量</span><input type="number" value="'+v[1]+'" step="0.01" data-cat="press120-'+k+'" data-field="1"></div>';}).join('');
  document.getElementById('setPress142').innerHTML=Object.keys(PRICE.press142).map(function(sz){var inner=PRICE.press142[sz];return'<div style="margin-bottom:8px"><b>'+sz+'</b>'+Object.keys(inner).map(function(k){var v=inner[k];return'<div class="srow"><label>'+k+'色</label><span>开机</span><input type="number" value="'+v[0]+'" step="1" data-cat="press142-'+sz+'-'+k+'" data-field="0"><span>超量</span><input type="number" value="'+v[1]+'" step="0.01" data-cat="press142-'+sz+'-'+k+'" data-field="1"></div>';}).join('');}).join('</div>');
  document.getElementById('setMount').innerHTML=sf('裱瓦',PRICE.mount,'元/㎡','0.01');
  document.getElementById('setDieCut').innerHTML=Object.keys(PRICE.dieCut).map(function(k){var v=PRICE.dieCut[k];return'<div class="srow"><label>'+k+'</label><span>装</span><input type="number" value="'+v[0]+'" step="1" data-cat="dieCut-'+k+'" data-field="0"><span>加工</span><input type="number" value="'+v[1]+'" step="0.01" data-cat="dieCut-'+k+'" data-field="1"></div>';}).join('');
  document.getElementById('setGlue').innerHTML=[
    {k:'卡盒 糊口<20',d:'卡盒 糊口&lt;20cm'},
    {k:'卡盒 展开>80',d:'卡盒 展开&gt;80cm'},
    {k:'瓦楞 糊口<20',d:'瓦楞 糊口&lt;20cm'},
    {k:'瓦楞 糊口20~30',d:'瓦楞 糊口20~30cm'},
    {k:'瓦楞 糊口>30',d:'瓦楞 糊口&gt;30cm'},
    {k:'瓦楞 长>60',d:'瓦楞 成品长度&gt;60cm'},
    {k:'瓦楞 长>80',d:'瓦楞 成品长度&gt;80cm'}
  ].map(function(x){return '<div class="srow"><label>'+x.d+'</label><input type="number" value="'+PRICE.glue[x.k]+'" step="0.01" data-cat="'+x.k+'" data-unit="元/个"><span class="unit">元/个</span></div>';}).join('');
  document.getElementById('setTransport').innerHTML=Object.keys(PRICE.transport).map(function(k){return sf(k,PRICE.transport[k],'元/㎡','0.01');}).join('');
  document.getElementById('setOverlay').classList.add('show');
}
saveSettings=function(){
  document.querySelectorAll('#setOverlay input').forEach(function(inp){
    var cat=inp.dataset.cat,val=parseFloat(inp.value)||0;
    if(cat==='裱瓦')PRICE.mount=val;
    else if(cat.startsWith('press120-')){
      var parts=cat.split('-'),pf=parts[0],pKey=parts[1],pField=parseInt(inp.dataset.field);
      PRICE[pf][pKey+''][pField]=val;
    }else if(cat.startsWith('press142-')){
      var parts=cat.split('-'),sz=parts[1],pKey=parts[2],pField=parseInt(inp.dataset.field);
      PRICE.press142[sz][pKey][pField]=val;
    }else if(cat.startsWith('dieCut-')){
      var key=cat.replace('dieCut-',''),field=parseInt(inp.dataset.field);
      PRICE.dieCut[key][field]=val;
    }else if(PRICE.surfaceFilm[cat]!==undefined)PRICE.surfaceFilm[cat]=val;
    else if(PRICE.surfaceK[cat]!==undefined)PRICE.surfaceK[cat]=val;
    else if(PRICE.glue[cat]!==undefined)PRICE.glue[cat]=val;
    else if(PRICE.transport[cat]!==undefined)PRICE.transport[cat]=val;
  });
  localStorage.setItem('priceSettings',JSON.stringify({
    surfaceFilm:PRICE.surfaceFilm,
    surfaceK:PRICE.surfaceK,
    press120:PRICE.press120,
      press142:PRICE.press142,
      mount:PRICE.mount,
    dieCut:PRICE.dieCut,
    glue:PRICE.glue,
    transport:PRICE.transport
  }));
  closeSettings();alert('✅ 已保存');
};
closeSettings=function(){document.getElementById('setOverlay').classList.remove('show');};

// ========== 报价记录管理 ==========
function saveQuote(){
  var C=window._costs||{};
  var qty=parseInt(document.getElementById('quantity').value)||0;
  if(!qty||Object.keys(C).length===0){alert('请先计算报价');return;}
  var clientName=prompt('请输入客户/产品名称：');if(!clientName||!clientName.trim()){alert('名称不能为空');return;}clientName=clientName.trim();

  // === 读取所有表单参数 ===
  var pL=parseFloat(document.getElementById('dieL').value)||0;
  var pW=parseFloat(document.getElementById('dieW').value)||0;
  var cutL=pL+20, cutW=pW+20; cutW=Math.ceil(cutW/50)*50;
  var gram=parseInt(document.getElementById('paperGram').value)||0;
  var tonPrice=parseFloat(document.getElementById('paperTon').value)||0;
  var flutePrice=parseFloat(document.getElementById('flutePrice').value)||0;
  var nUp=parseInt(document.getElementById('piecesPerSheet').value)||1;
  var paperLossRaw=document.getElementById('paperLoss').value;
  var paperLoss=paperLossRaw===''?0:parseFloat(paperLossRaw);
  if(isNaN(paperLoss))paperLoss=200;
  var fluteLossRaw=document.getElementById('fluteLoss').value;
  var fluteLoss=fluteLossRaw===''?0:parseFloat(fluteLossRaw);
  if(isNaN(fluteLoss))fluteLoss=30;

  var pressMachine=document.getElementById('pressMachine').value;
  var pressName=pressMachine==='120'?'120对开机':'142全开机';
  var colors=document.getElementById('colors').value;
  var plateSize=pressMachine==='120'?'--':(document.getElementById('pressMachine').dataset.plate||'142×102');
  var waivePressBase=document.getElementById('waivePressBase').checked;

  var surfaceEls=document.querySelectorAll('#surfaceGroup input:checked');
  var surfaceList=[]; surfaceEls.forEach(function(c){surfaceList.push(c.value);});
  var surfaceStr=surfaceList.join('+')||'无';

  var mountDisp=document.getElementById('mountDisplay').value||'--';
  var dieNew=document.getElementById('dieNew').value;
  var dieCutMachine=document.getElementById('dieCutMachine').value;
  var waiveDieSetup=document.getElementById('waiveDieSetup').checked;
  var glueBox=document.getElementById('glueBox').value;
  var transport=document.getElementById('transport').value;

  var taxVal=document.getElementById('taxRate').value;
  var taxPct=taxVal===''?13:parseInt(taxVal)||0;
  var marginPct=parseInt(document.getElementById('marginPct').value);
  if(isNaN(marginPct))marginPct=20;

  var extraUnitSel=document.getElementById('extraCostUnit');
  var extraMode=extraUnitSel.options[extraUnitSel.selectedIndex].text;
  var extraVal=parseFloat(document.getElementById('extraCost').value)||0;

  // === 从 window._costs 取各分项小计 ===
  var paperTotal=C.paper||0;
  var fluteTotal=C.flute||0;
  var pressTotal=C.press||0;
  var surfaceCost=C.surface||0;
  var mountTotal=C.mount||0;
  var dieFee=C.die||0;
  var dieCutCost=C.dieCut||0;
  var glueCost=C.glue||0;
  var tsCost=C.transport||0;
  var extraCost=C.extra||0;

  var allCost=paperTotal+fluteTotal+pressTotal+mountTotal+dieCutCost+glueCost+dieFee+tsCost+surfaceCost+extraCost;
  var cpu=allCost/qty;
  var tax=taxPct/100, margin=marginPct/100;
  var sp=cpu*(1+tax)/(1-margin);
  var total=sp*qty;

  var now=new Date();
  var ts=now.getFullYear()+'.'+String(now.getMonth()+1).padStart(2,'0')+'.'+String(now.getDate()).padStart(2,'0')+' '+String(now.getHours()).padStart(2,'0')+':'+String(now.getMinutes()).padStart(2,'0');

  var record={
    name:clientName,
    time:ts,
    dieL:pL, dieW:pW,
    cutL:cutL, cutW:cutW,
    gram:gram, tonPrice:tonPrice,
    flutePrice:flutePrice,
    nUp:nUp, qty:qty,
    paperLoss:paperLoss, fluteLoss:fluteLoss,
    pressMachine:pressName,
    colors:colors+'色',
    plateSize:plateSize,
    waivePressBase:waivePressBase,
    surface:surfaceStr,
    mount:mountDisp,
    dieNew:dieNew==='1'?'新版':'旧版',
    dieCutMachine:dieCutMachine,
    waiveDieSetup:waiveDieSetup,
    glueBox:glueBox,
    transport:transport,
    taxRate:taxPct, marginPct:marginPct,
    extraMode:extraMode, extraVal:extraVal,
    paperTotal:paperTotal, fluteTotal:fluteTotal,
    pressTotal:pressTotal, surfaceCost:surfaceCost,
    mountTotal:mountTotal, dieFee:dieFee,
    dieCutCost:dieCutCost, glueCost:glueCost,
    tsCost:tsCost, extraCost:extraCost,
    allCost:allCost,
    unitPrice:sp, total:total
  };

  var history=JSON.parse(localStorage.getItem('colorBoxHistory')||'[]');
  history.unshift(record);
  localStorage.setItem('colorBoxHistory', JSON.stringify(history));

  renderQuoteHistory();
  alert('✅ 报价已保存');
}

function renderQuoteHistory(){
  var history=JSON.parse(localStorage.getItem('colorBoxHistory')||'[]');
  var tbody=document.getElementById('historyBody');
  if(!history.length){tbody.innerHTML='<tr><td colspan="9" style="text-align:center;color:#aaa;padding:20px">暂无记录</td></tr>';return;}
  tbody.innerHTML=history.map(function(r,i){
    var dL=(r.dieL||0), dW=(r.dieW||0);
    var q=(r.qty||0);
    var paperMat=(r.gram||0)+'g/¥'+(r.tonPrice||0);
    var fluteMat='¥'+(r.flutePrice||0)+'/㎡';
    var cost=(r.unitPrice||0).toFixed(4);
    var tip='<b>\u{1f4cb} 完整报价参数</b><br>'
      +'刀版: '+dL.toFixed(0)+'\u00d7'+dW.toFixed(0)+'mm | 裁切: '+(r.cutL||'--')+'\u00d7'+(r.cutW||'--')+'mm<br>'
      +'克重: '+paperMat+' | 浪纸单价: '+fluteMat+'<br>'
      +'拼版: '+(r.nUp||'--')+' | 数量: '+q+'<br>'
      +'损耗: 面纸'+(r.paperLoss||0)+'张 / 浪纸'+(r.fluteLoss||0)+'张<br>'
      +'印刷: '+(r.pressMachine||'--')+' '+(r.colors||'--')+' | 版纸: '+(r.plateSize||'--')+' | 免开机: '+(r.waivePressBase?'是':'否')+'<br>'
      +'表面: '+(r.surface||'无')+'<br>'
      +'裱瓦: '+(r.mount||'--')+'<br>'
      +'刀版: '+(r.dieNew||'--')+' | 模切: '+(r.dieCutMachine||'--')+' | 免装版: '+(r.waiveDieSetup?'是':'否')+'<br>'
      +'粘盒: '+(r.glueBox||'--')+'<br>'
      +'运输: '+(r.transport||'--')+'<br>'
      +'税率: '+(r.taxRate||0)+'% | 毛利率: '+(r.marginPct||0)+'%<br>'
      +'其他成本: '+(r.extraMode||'--')+' \u00a5'+(r.extraVal||0)+'<br>'
      +'<hr>'
      +'面纸\u00a5'+((r.paperTotal||0).toFixed(2))+' + 浪纸\u00a5'+((r.fluteTotal||0).toFixed(2))+' + 印刷\u00a5'+((r.pressTotal||0).toFixed(2))+'<br>'
      +'表面\u00a5'+((r.surfaceCost||0).toFixed(2))+' + 裱瓦\u00a5'+((r.mountTotal||0).toFixed(2))+' + 刀版\u00a5'+((r.dieFee||0).toFixed(2))+'<br>'
      +'模切\u00a5'+((r.dieCutCost||0).toFixed(2))+' + 粘盒\u00a5'+((r.glueCost||0).toFixed(2))+' + 运输\u00a5'+((r.tsCost||0).toFixed(2))+'<br>'
      +'其他\u00a5'+((r.extraCost||0).toFixed(2))+' = <b>总成本 \u00a5'+((r.allCost||0).toFixed(2))+'</b><br>'
      +'含税含利单价: \u00a5'+((r.unitPrice||0).toFixed(4))+' | 总价: \u00a5'+((r.total||0).toFixed(2));
    return '<tr><td style="padding:6px 8px;border-bottom:1px solid #eee;text-align:center"><input type="checkbox" class="quoteCb" data-idx="'+i+'" onchange="updateSelectedCount()"></td><td style="padding:6px 8px;border-bottom:1px solid #eee">'+(r.name||'')+'</td><td style="padding:6px 8px;border-bottom:1px solid #eee">'+r.time+'</td><td style="padding:6px 8px;border-bottom:1px solid #eee;text-align:right">'+dL.toFixed(0)+'\u00d7'+dW.toFixed(0)+'</td><td style="padding:6px 8px;border-bottom:1px solid #eee;text-align:right">'+paperMat+'</td><td style="padding:6px 8px;border-bottom:1px solid #eee;text-align:right">'+fluteMat+'</td><td style="padding:6px 8px;border-bottom:1px solid #eee;text-align:right">'+q+'</td><td style="padding:6px 8px;border-bottom:1px solid #eee;text-align:right">\u00a5'+cost+'</td><td style="padding:6px 8px;border-bottom:1px solid #eee;text-align:center" onmouseenter=\'showTooltip(event,'+JSON.stringify(tip)+')\' onmouseleave=\'hideTooltip()\'><button onclick="deleteQuote('+i+')" style="background:#e74c3c;color:#fff;border:none;padding:2px 8px;border-radius:4px;cursor:pointer;font-size:0.75rem">删除</button> <button onclick="exportSingleXLSX('+i+')" style="background:#3498db;color:#fff;border:none;padding:2px 8px;border-radius:4px;cursor:pointer;font-size:0.75rem">导出</button></td></tr>';
  }).join('');
  updateSelectedCount();
}
function deleteQuote(idx){
  if(!confirm('确定删除该条报价记录？'))return;
  var history=JSON.parse(localStorage.getItem('colorBoxHistory')||'[]');
  history.splice(idx,1);
  localStorage.setItem('colorBoxHistory',JSON.stringify(history));
  renderQuoteHistory();
}
function clearQuoteHistory(){
  if(!confirm('确定清空所有报价记录？此操作不可恢复。'))return;
  localStorage.removeItem('colorBoxHistory');
  renderQuoteHistory();
}
function toggleAllCheckboxes(){
  var checked=document.getElementById('selectAll').checked;
  document.querySelectorAll('.quoteCb').forEach(function(cb){cb.checked=checked;});
  updateSelectedCount();
}
function updateSelectedCount(){
  var cbs=document.querySelectorAll('.quoteCb:checked');
  document.getElementById('selectedCount').textContent='已选 '+cbs.length+' 条';
  var total=document.querySelectorAll('.quoteCb').length;
  document.getElementById('selectAll').checked=total>0 && cbs.length===total;
}
function buildQuoteSheet(r){
  var rows=[];
  var qty=r.qty||1;
  var fluteL=((r.dieL||0)+10).toFixed(0);
  var fluteW=((r.dieW||0)+30).toFixed(0);
  rows.push(['客户/产品名称',r.name||'']);
  rows.push(['日期',r.time||'']);
  rows.push(['数量',qty]);
  rows.push(['刀版尺寸',(r.dieL||0).toFixed(0)+' × '+(r.dieW||0).toFixed(0)+' mm']);
  rows.push(['裁切尺寸 (凑整)',(r.cutL||'--')+' × '+(r.cutW||'--')+' mm']);
  rows.push(['浪纸尺寸 (+20mm)',fluteL+' × '+fluteW+' mm']);
  rows.push(['拼版数',r.nUp||1]);
  rows.push(['成本明细','']);
  rows.push(['工序','小计 (元)']);
  var items=[
    {name:'面纸',desc:(r.gram||'')+'g '+(r.tonPrice||'')+'/t',val:r.paperTotal||0},
    {name:'浪纸',desc:(r.flutePrice||'')+'/㎡',val:r.fluteTotal||0},
    {name:'印刷',desc:(r.pressMachine||'')+' '+(r.colors||''),val:r.pressTotal||0},
    {name:'表面处理',desc:r.surface||'',val:r.surfaceCost||0},
    {name:'裱瓦',desc:r.mount||'',val:r.mountTotal||0},
    {name:'刀版',desc:r.dieNew||'',val:r.dieFee||0},
    {name:'模切',desc:r.dieCutMachine||'',val:r.dieCutCost||0},
    {name:'粘盒',desc:r.glueBox||'',val:r.glueCost||0},
    {name:'运输',desc:r.transport||'',val:r.tsCost||0},
    {name:'其他成本',desc:(r.extraMode||'')+' ¥'+(r.extraVal||0),val:r.extraCost||0}
  ];
  var totalCost=0;
  items.forEach(function(it){
    if(it.val>0){
      var label=it.name+(it.desc?'-'+it.desc:'');
      rows.push([label,it.val]);
      totalCost+=it.val;
    }
  });
  var singleCost=totalCost/qty;
  var taxRate=r.taxRate||0;
  var marginRate=r.marginPct||0;
  var taxPrice=singleCost*(1+taxRate/100);
  var marginPrice=taxPrice/(1-marginRate/100);
  rows.push(['报价汇总','']);
  rows.push(['总价',totalCost]);
  rows.push(['单个成本',singleCost]);
  rows.push(['含税'+taxRate+'%',taxPrice]);
  rows.push(['毛利'+marginRate+'%',marginPrice]);

  var ws=XLSX.utils.aoa_to_sheet(rows);

  // --- Cell Style Definitions ---
  var titleFill = {fgColor:{rgb:'2F5496'}};         // Deep blue
  var headerFill = {fgColor:{rgb:'D6E4F0'}};         // Light blue
  var labelFill = {fgColor:{rgb:'F2F2F2'}};          // Light gray
  var titleFont = {name:'微软雅黑',sz:14,bold:true,color:{rgb:'FFFFFF'}};
  var headerFont = {name:'微软雅黑',sz:11,bold:true,color:{rgb:'333333'}};
  var labelFont  = {name:'微软雅黑',sz:11,bold:true,color:{rgb:'333333'}};
  var valFont    = {name:'微软雅黑',sz:11,color:{rgb:'000000'}};
  var border = {
    top:{style:'thin',color:{rgb:'000000'}},
    bottom:{style:'thin',color:{rgb:'000000'}},
    left:{style:'thin',color:{rgb:'000000'}},
    right:{style:'thin',color:{rgb:'000000'}}
  };
  var numFmt = '#,##0.00';
  var intFmt = '#,##0';

  // Determine which rows are which
  var titleRows = [0, 8, 8+items.filter(function(it){return it.val>0;}).length+1]; // 标题, 成本明细, 报价汇总
  var subHeaderRows = [9]; // 工序 | 小计 header row
  var isNumCol = {}; // track which cells in col B are numeric

  // Build map: row index -> type
  var rowType={};
  titleRows.forEach(function(rr){rowType[rr]='title';});
  subHeaderRows.forEach(function(rr){rowType[rr]='subheader';});
  // All other rows in col A are labels, col B may be numeric

  var range = XLSX.utils.decode_range(ws['!ref']);
  for(var R=range.s.r; R<=range.e.r; R++){
    for(var C=range.s.c; C<=range.e.c; C++){
      var addr = XLSX.utils.encode_cell({r:R, c:C});
      if(!ws[addr]) ws[addr]={v:'',t:'s'};
      var cell = ws[addr];
      var val = cell.v;
      var typ = typeof val === 'number' ? 'n' : 's';

      // Determine style
      if(rowType[R]==='title'){
        cell.s = {font:titleFont, fill:titleFill, alignment:{horizontal:'center',vertical:'center',wrapText:true}, border:border};
        if(typ==='n') cell.z = numFmt;
      } else if(rowType[R]==='subheader'){
        if(C===0){
          cell.s = {font:labelFont, fill:headerFill, alignment:{horizontal:'left'}, border:border};
        } else {
          cell.s = {font:headerFont, fill:headerFill, alignment:{horizontal:'right'}, border:border};
          if(typ==='n'){ cell.z = numFmt; cell.t = 'n'; }
        }
      } else if(C===0){
        // Label column
        cell.s = {font:labelFont, fill:labelFill, alignment:{horizontal:'left',vertical:'center'}, border:border};
      } else {
        // Value column
        if(typ==='n'){
          cell.s = {font:valFont, alignment:{horizontal:'right',vertical:'center'}, border:border};
          cell.z = numFmt;
          cell.t = 'n';
        } else {
          cell.s = {font:valFont, alignment:{horizontal:'right',vertical:'center'}, border:border};
        }
      }
    }
  }

  // Column widths
  var maxA=10, maxB=10;
  for(var R=0; R<=range.e.r; R++){
    var addrA=XLSX.utils.encode_cell({r:R,c:0});
    var addrB=XLSX.utils.encode_cell({r:R,c:1});
    if(ws[addrA] && ws[addrA].v!==undefined){
      var s = String(ws[addrA].v);
      var w = 0; for(var i=0;i<s.length;i++){var cc=s.charCodeAt(i);w+=(cc>127?2:1);}
      if(w>maxA)maxA=w;
    }
    if(ws[addrB] && ws[addrB].v!==undefined){
      var s = String(ws[addrB].v);
      var w = 0; for(var i=0;i<s.length;i++){var cc=s.charCodeAt(i);w+=(cc>127?2:1);}
      if(w>maxB)maxB=w;
    }
  }
  ws['!cols']=[{wch:Math.min(maxA+4,40)},{wch:Math.min(maxB+4,28)}];

  return ws;
}
function exportSingleXLSX(idx){
  var history=JSON.parse(localStorage.getItem('colorBoxHistory')||'[]');
  if(idx<0||idx>=history.length){alert('记录不存在');return;}
  var r=history[idx];
  var wb=XLSX.utils.book_new();
  var ws=buildQuoteSheet(r);
  var sName=(r.name||'报价').substring(0,31);
  XLSX.utils.book_append_sheet(wb,ws,sName);
  XLSX.writeFile(wb,(r.name||'报价')+'_'+r.time.replace(/[: ]/g,'_')+'.xlsx');
}
function exportSelectedXLSX(){
  var cbs=document.querySelectorAll('.quoteCb:checked');
  if(!cbs.length){alert('请先勾选要导出的记录');return;}
  var history=JSON.parse(localStorage.getItem('colorBoxHistory')||'[]');
  var wb=XLSX.utils.book_new();
  var hasSheets=false;
  var usedNames={};
  cbs.forEach(function(cb){
    var idx=parseInt(cb.dataset.idx);
    if(idx>=0&&idx<history.length){
      var r=history[idx];
      var ws=buildQuoteSheet(r);
      var rawName=r.name||('报价'+idx);
      var sName=rawName.substring(0,31);
      if(usedNames[sName]!==undefined){
        var cnt=1;
        while(usedNames[sName+'_'+cnt]!==undefined)cnt++;
        sName=sName+'_'+cnt;
      }
      usedNames[sName]=true;
      XLSX.utils.book_append_sheet(wb,ws,sName);
      hasSheets=true;
    }
  });
  if(!hasSheets){alert('没有有效的记录可导出');return;}
  XLSX.writeFile(wb,'报价记录_多选_'+new Date().toISOString().slice(0,10)+'.xlsx');
}

function showTooltip(e,html){var g=document.getElementById('globalTooltip');g.innerHTML=html;g.style.display='block';g.style.left=Math.min(e.clientX+10,window.innerWidth-320)+'px';g.style.top=(e.clientY-10)+'px';}
function hideTooltip(){document.getElementById('globalTooltip').style.display='none';}

renderQuoteHistory();
