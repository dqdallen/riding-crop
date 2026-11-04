const core=require('../../utils/core');const state=require('../../utils/state');
const money=(n,d=2)=>{const parts=Number(n).toFixed(d).split('.');parts[0]=parts[0].replace(/\B(?=(\d{3})+(?!\d))/g,',');return parts.join('.');};
const quotes=['工资在涨，快乐也不要落下。','每一份积累，都在认真地奔向你。','慢慢来，喜欢的生活正在路上。','工作是生活的一部分，记得留点快乐给自己。'];
Page({
 onLoad(){if(wx.showShareMenu)wx.showShareMenu({menus:['shareAppMessage','shareTimeline']});},
 data:{tab:'month',hiddenMoney:false,compact:false,quote:quotes[0]},
 onShow(){this.stopTimer();this.current=state.load();this.previous=null;this.setData({hiddenMoney:this.current.hidden});this.update();this.timer=setInterval(()=>this.update(),1000);},
 onHide(){this.stopTimer();},onUnload(){this.stopTimer();},stopTimer(){if(this.timer){clearInterval(this.timer);this.timer=null;}},
 update(){const now=new Date(),{settings,goal,saved,preferences}=this.current,r=core.calculate(settings,now),pay=core.paydayInfo(settings.payday,now),monthly=this.data.tab==='month',t=Math.ceil(r.remaining),count=Math.floor(r.earned/goal.price);
 if(saved&&preferences.milestones&&this.previous&&this.previous.shiftDate===r.shiftDate&&count>Math.floor(this.previous.earned/goal.price))wx.showToast({title:'小目标达成，奖励一下自己',icon:'none'});this.previous=r;
 this.setData({saved,date:`${now.getFullYear()} 年 ${now.getMonth()+1} 月 ${now.getDate()} 日 · 星期${'日一二三四五六'[now.getDay()]}`,income:money(r.earned),status:r.status,progress:Math.round(r.progress*10000)/100,percentage:(r.progress*100).toFixed(1),daily:money(r.daily),second:money(r.second,4),minute:money(r.minute),hour:money(r.hour),start:settings.start,end:settings.end+(settings.end<settings.start?' 次日':''),hh:String(Math.floor(t/3600)).padStart(2,'0'),mm:String(Math.floor(t%3600/60)).padStart(2,'0'),ss:String(t%60).padStart(2,'0'),countCaption:!r.active?'今天不用上班，好好休息':r.status==='已下班'?'今日努力完成，快乐下班！':'距离今天快乐下班，还有',periodEarned:money(monthly?r.monthEarned:r.weekEarned),periodTarget:money(monthly?r.monthTarget:r.weekTarget),periodDays:monthly?r.monthDays:r.weekDays,periodProgress:Math.min(100,(monthly?r.monthTarget:r.weekTarget)?(monthly?r.monthEarned:r.weekEarned)/(monthly?r.monthTarget:r.weekTarget)*100:0),goalName:goal.name,goalPrice:money(goal.price),goalMessage:count>0?`已赚到 ${count} 份小快乐 ✓`:`再赚 ¥${money(Math.max(0,goal.price-r.earned))} 就实现啦`,goalProgress:Math.min(100,r.earned/goal.price*100),paydayDays:pay.days===0?'今天到账日':pay.days+' 天',paydayDate:pay.date,notes:r.status==='休息日'?'今天休息，把时间留给自己。':r.status==='已下班'?'今日的努力已到账，好好享受生活。':r.status==='还没上班'?'还没上班，先给自己充个电。':r.status==='午休充电中'?'不计薪休息中，收入计时暂停。':'每一秒，都在向小目标靠近。'});},
 togglePrivacy(){const hidden=!this.data.hiddenMoney;this.setData({hiddenMoney:hidden});try{state.saveHidden(hidden);}catch{wx.showToast({title:'本次已隐藏，保存失败',icon:'none'});}},
 changeTab(e){this.setData({tab:e.currentTarget.dataset.tab});this.update();},
 toggleCompact(){this.setData({compact:!this.data.compact});},
 openSettings(){wx.navigateTo({url:'/pages/settings/settings'});},openCalendar(){wx.navigateTo({url:'/pages/calendar/calendar'});},openGoal(){wx.navigateTo({url:'/pages/goal/goal'});},
 nextQuote(){this.quoteIndex=((this.quoteIndex||0)+1)%quotes.length;this.setData({quote:quotes[this.quoteIndex]});},
 showMethod(){wx.showModal({title:'计算说明',content:'月薪按当月实际排班天数分摊；周薪按周一到周日的实际排班天数分摊。计薪秒数会扣除你设置的不计薪休息。上班前为零，下班后封顶。\n\n按设备当地时间估算，累计收入按当前设置回算。不自动处理法定节假日，不含税费、奖金及加班费。关闭后不持续运行，重新打开按时间补算。',showCancel:false});},
 onShareAppMessage(){return {title:'每一秒，都有小收获。一起积攒生活的小快乐！',path:'/pages/home/home'};},
 onShareTimeline(){return {title:'薪情不错：每一秒，都有小收获。'};}
});
