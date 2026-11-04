const core=require('./core');
const KEY='salary-cheer-v1',GOAL='salary-cheer-goal';
function load(){let settings=core.normalizeSettings(core.DEFAULTS),goal={...core.DEFAULT_GOAL},saved=false,hidden=false,preferences={milestones:true};try{const raw=wx.getStorageSync(KEY);if(raw){settings=core.normalizeSettings(raw);saved=true;}const g=wx.getStorageSync(GOAL);if(g)goal=core.normalizeGoal(g);hidden=!!wx.getStorageSync('salary-cheer-hidden');preferences={...preferences,...wx.getStorageSync('salary-cheer-preferences')};}catch{}return {settings,goal,saved,hidden,preferences};}
function save(settings,goal){const s=core.normalizeSettings(settings),g=core.normalizeGoal(goal||load().goal);wx.setStorageSync(KEY,s);wx.setStorageSync(GOAL,g);}
function saveHidden(hidden){wx.setStorageSync('salary-cheer-hidden',hidden);}
module.exports={load,save,saveHidden};
