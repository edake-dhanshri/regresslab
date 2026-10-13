(() => {
  "use strict";
  const $ = (id) => document.getElementById(id);
  const sampleData = {
    study: { xName: "Study hours", yName: "Exam score", x: [1,2,2.5,3,4,4.5,5,6,6.5,7,8,9], y: [38,45,49,52,57,63,61,72,70,78,83,91] },
    house: { xName: "House size (100 sq ft)", yName: "Price ($1000s)", x: [5,7,8,9,10,11,12,13,14,15,17,18], y: [145,180,195,220,225,250,267,280,305,315,350,380] },
    temperature: { xName: "Temperature (°C)", yName: "Ice cream sales", x: [14,16,18,20,22,24,25,27,29,30,32,34], y: [18,22,25,31,34,38,42,45,50,53,58,62] },
    noisy: { xName: "Input value", yName: "Observed output", x: [1,2,3,4,5,6,7,8,9,10,11,12], y: [12,8,19,15,26,20,30,25,38,31,44,39] }
  };
  let xs = [], ys = [], model = {}, activeData = "study";
  const fmt = (n, digits = 2) => Number.isFinite(n) ? n.toFixed(digits) : "—";
  const clone = (a) => a.map(Number);

  function loadDataset(key) {
    activeData = key;
    const d = sampleData[key];
    xs = clone(d.x); ys = clone(d.y);
    $("xLabel").value = d.xName; $("yLabel").value = d.yName;
    $("predictX").min = Math.min(...xs); $("predictX").max = Math.max(...xs);
    $("predictX").value = Math.min(Math.max(6, Math.min(...xs)), Math.max(...xs));
    $("predictValue").value = $("predictX").value;
    render();
  }
  function fitLine() {
    const n = xs.length;
    if (n < 2) return { intercept: ys[0] || 0, slope: 0, r2: 0, rmse: 0, predictions: xs.map(() => ys[0] || 0) };
    const mx = xs.reduce((a,b)=>a+b,0)/n, my = ys.reduce((a,b)=>a+b,0)/n;
    let num=0, den=0;
    for(let i=0;i<n;i++){num+=(xs[i]-mx)*(ys[i]-my);den+=(xs[i]-mx)**2;}
    const slope = den ? num/den : 0, intercept = my-slope*mx;
    const predictions = xs.map(x=>intercept+slope*x);
    const sse = ys.reduce((s,y,i)=>s+(y-predictions[i])**2,0);
    const sst = ys.reduce((s,y)=>s+(y-my)**2,0);
    return {intercept,slope,r2:sst ? 1-sse/sst : 1,rmse:Math.sqrt(sse/n),predictions};
  }
  function buildTable() {
    const body = $("dataRows"); body.innerHTML = "";
    xs.forEach((x,i)=>{
      const tr=document.createElement("tr");
      tr.innerHTML=`<td>${i+1}</td><td><input aria-label="X value row ${i+1}" type="number" step="any" data-index="${i}" data-axis="x" value="${x}"></td><td><input aria-label="Y value row ${i+1}" type="number" step="any" data-index="${i}" data-axis="y" value="${ys[i]}"></td><td>${fmt(model.predictions[i])}</td><td class="residual-cell">${fmt(ys[i]-model.predictions[i])}</td><td><button class="delete-row" data-delete="${i}" aria-label="Delete row ${i+1}" title="Delete row">×</button></td>`;
      body.appendChild(tr);
    });
    $("pointCount").textContent=xs.length;
    $("tableSummary").textContent=`${xs.length} observation${xs.length===1?"":"s"}`;
    $("xHead").textContent=`X — ${$("xLabel").value || "Input"}`;
    $("yHead").textContent=`Y — ${$("yLabel").value || "Output"}`;
  }
  function renderChart() {
    if (!window.Plotly) {
      $("chart").innerHTML='<p style="padding:30px;color:#64748b">The graph library could not load. Check your internet connection and refresh.</p>';
      return;
    }
    const minX=Math.min(...xs), maxX=Math.max(...xs), span=maxX-minX || 1;
    const lineX=[minX-span*.08,maxX+span*.08];
    const lineY=lineX.map(x=>model.intercept+model.slope*x);
    const traces=[];
    if($("showBand").checked){
      const n=xs.length, mx=xs.reduce((a,b)=>a+b,0)/n;
      const sxx=xs.reduce((s,x)=>s+(x-mx)**2,0);
      const se=model.rmse;
      const upper=lineX.map(x=>model.intercept+model.slope*x+1.96*se*Math.sqrt(1/n+(sxx?(x-mx)**2/sxx:0)));
      const lower=lineX.map(x=>model.intercept+model.slope*x-1.96*se*Math.sqrt(1/n+(sxx?(x-mx)**2/sxx:0)));
      traces.push({x:[...lineX,...lineX.slice().reverse()],y:[...upper,...lower.slice().reverse()],fill:"toself",fillcolor:"rgba(37,99,235,.12)",line:{color:"rgba(37,99,235,0)"},hoverinfo:"skip",name:"Approx. confidence band"});
    }
    if($("showResiduals").checked){
      const rx=[],ry=[];
      xs.forEach((x,i)=>{rx.push(x,x,null);ry.push(ys[i],model.predictions[i],null);});
      traces.push({x:rx,y:ry,type:"scatter",mode:"lines",line:{color:"#f59e0b",width:1.5,dash:"dot"},hoverinfo:"skip",name:"Residuals"});
    }
    traces.push({x:xs,y:ys,type:"scatter",mode:"markers",name:"Observed data",marker:{size:10,color:"#5795f5",line:{color:"#fff",width:1.5}},customdata:xs.map((x,i)=>[ys[i],model.predictions[i],ys[i]-model.predictions[i]]),hovertemplate:"X: %{x}<br>Observed Y: %{customdata[0]:.2f}<br>Predicted Y: %{customdata[1]:.2f}<br>Residual: %{customdata[2]:.2f}<extra></extra>"});
    if($("showLine").checked)traces.push({x:lineX,y:lineY,type:"scatter",mode:"lines",name:"Best-fit line",line:{color:"#1d4ed8",width:3},hovertemplate:"X: %{x:.2f}<br>Predicted Y: %{y:.2f}<extra>Best-fit line</extra>"});
    const layout={margin:{l:58,r:20,t:16,b:54},paper_bgcolor:"#fff",plot_bgcolor:"#fff",font:{family:"Inter, system-ui, sans-serif",size:11,color:"#71829a"},xaxis:{title:{text:$("xLabel").value || "X",font:{size:11}},gridcolor:"#edf2fa",zerolinecolor:"#d9e3f1",linecolor:"#d9e3f1",automargin:true},yaxis:{title:{text:$("yLabel").value || "Y",font:{size:11}},gridcolor:"#edf2fa",zerolinecolor:"#d9e3f1",linecolor:"#d9e3f1",automargin:true},legend:{orientation:"h",y:1.13,x:0,font:{size:10}},hovermode:"closest",showlegend:true};
    Plotly.react("chart",traces,layout,{responsive:true,displaylogo:false,modeBarButtonsToRemove:["lasso2d","select2d","autoScale2d"]});
  }
  function render() {
    model=fitLine();
    $("slopeStat").textContent=fmt(model.slope);
    $("r2Stat").textContent=fmt(model.r2);
    $("rmseStat").textContent=fmt(model.rmse);
    $("equation").textContent=`ŷ = ${fmt(model.intercept)} ${model.slope<0?"−":"+"} ${fmt(Math.abs(model.slope))}x`;
    const px=Number($("predictX").value);
    $("prediction").textContent=fmt(model.intercept+model.slope*px);
    $("predictValue").value=px;
    buildTable(); renderChart();
  }
  function addRow(x,y) { xs.push(x); ys.push(y); render(); }
  $("dataset").addEventListener("change",e=>loadDataset(e.target.value));
  ["showLine","showResiduals","showBand"].forEach(id=>$(id).addEventListener("change",render));
  ["xLabel","yLabel"].forEach(id=>$(id).addEventListener("input",()=>{ $("xHead").textContent=`X — ${$("xLabel").value||"Input"}`; $("yHead").textContent=`Y — ${$("yLabel").value||"Output"}`; renderChart(); }));
  $("predictX").addEventListener("input",()=>{const px=Number($("predictX").value);$("predictValue").value=px;$("prediction").textContent=fmt(model.intercept+model.slope*px);});
  $("dataRows").addEventListener("change",e=>{
    const input=e.target.closest("input[data-index]"); if(!input)return;
    const i=Number(input.dataset.index),v=Number(input.value);
    if(!Number.isFinite(v)||input.value.trim()===""){input.value=input.dataset.axis==="x"?xs[i]:ys[i];return;}
    if(input.dataset.axis==="x")xs[i]=v;else ys[i]=v;
    render();
  });
  $("dataRows").addEventListener("click",e=>{
    const b=e.target.closest("[data-delete]");if(!b)return;
    if(xs.length<=2){alert("Keep at least two observations to fit a line.");return;}
    const i=Number(b.dataset.delete);xs.splice(i,1);ys.splice(i,1);render();
  });
  $("addRow").addEventListener("click",()=>{const x=xs.length?Math.max(...xs)+1:1;addRow(x,model.intercept+model.slope*x);});
  $("addPoint").addEventListener("click",()=>{const x=Number($("predictX").value),y=model.intercept+model.slope*x;addRow(x,y);});
  $("resetTop").addEventListener("click",()=>{ $("dataset").value=activeData;loadDataset(activeData); });
  $("randomize").addEventListener("click",()=>{
    const min=Math.min(...xs),max=Math.max(...xs),span=max-min||10;
    const slope=(Math.random()*2-.4)*(Math.max(...ys)-Math.min(...ys))/span;
    const intercept=ys.reduce((a,b)=>a+b,0)/ys.length-slope*xs.reduce((a,b)=>a+b,0)/xs.length;
    ys=xs.map(x=>Math.round((intercept+slope*x+(Math.random()-.5)*span*.5)*100)/100);
    render();
  });
  $("downloadCsv").addEventListener("click",()=>{
    const rows=[["X label",$("xLabel").value],["Y label",$("yLabel").value],[],["X","Observed Y","Predicted Y","Residual"]];
    xs.forEach((x,i)=>rows.push([x,ys[i],model.predictions[i],ys[i]-model.predictions[i]]));
    const csv=rows.map(row=>row.map(v=>`"${String(v??"").replace(/"/g,'""')}"`).join(",")).join("\r\n");
    const url=URL.createObjectURL(new Blob([csv],{type:"text/csv;charset=utf-8;"}));
    const a=document.createElement("a");a.href=url;a.download="regresslab-data.csv";a.click();URL.revokeObjectURL(url);
  });
  loadDataset("study");
})();