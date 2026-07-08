var currentAIFlow = '';
var aiMessages = [];
var reportData = {};

async function loadAIPage() {
    var contentArea = document.getElementById('contentArea');
    if (!contentArea) return;
    contentArea.innerHTML = '<div class="ai-container"><div class="ai-header"><i class="fas fa-robot"></i><h2>AI Teaching Assistant</h2><p>No typing needed - just click choices. I will handle the rest.</p></div><div class="ai-flow-selector" id="flowSelector"><div class="flow-card" onclick="startAIFlow(\'daily_report\')"><i class="fas fa-calendar-check"></i><h4>Daily Report Wizard</h4><p>Fill your daily report with button choices</p></div><div class="flow-card" onclick="startAIFlow(\'lesson_plan\')"><i class="fas fa-book-open"></i><h4>Smart Lesson Planner</h4><p>Build lesson plans by selecting modules</p></div><div class="flow-card" onclick="startAIFlow(\'student_support\')"><i class="fas fa-hand-holding-heart"></i><h4>Student Intervention</h4><p>Identify & support struggling students</p></div><div class="flow-card" onclick="startAIFlow(\'lab_help\')"><i class="fas fa-microchip"></i><h4>Lab Issue Reporter</h4><p>Report and track lab issues</p></div><div class="flow-card" onclick="startAIFlow(\'survey_distribute\')"><i class="fas fa-paper-plane"></i><h4>Survey Distribution</h4><p>Send surveys to students via email</p></div><div class="flow-card" onclick="startAIFlow(\'survey_create\')"><i class="fas fa-magic"></i><h4>AI Survey Creator</h4><p>Generate surveys from a topic</p></div><div class="flow-card" onclick="startAIFlow(\'quick_chat\')"><i class="fas fa-comments"></i><h4>Quick Assistant</h4><p>Get instant answers about your system</p></div><div class="flow-card" onclick="startAIFlow(\'weekly_summary\')"><i class="fas fa-file-alt"></i><h4>Weekly Report Generator</h4><p>Auto-generate your weekly summary</p></div></div><div id="chatArea" style="display:none"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px"><strong id="chatTitle">AI Assistant</strong><button class="btn btn-outline btn-sm" onclick="resetAIFlow()"><i class="fas fa-arrow-left"></i> Back</button></div><div class="chat-container"><div class="chat-messages" id="chatMessages"></div><div id="aiFormArea" style="padding:16px;border-top:1px solid var(--border-color);background:#f8fafc"></div></div></div></div>';
}

function startAIFlow(flow) {
    currentAIFlow = flow; aiMessages = []; reportData = {};
    document.getElementById("flowSelector").style.display = "none";
    document.getElementById("chatArea").style.display = "block";
    document.getElementById("chatMessages").innerHTML = "";
    var titles = { daily_report: "Daily Report Wizard", lesson_plan: "Smart Lesson Planner", student_support: "Student Intervention", lab_help: "Lab Issue Reporter", survey_distribute: "Survey Distribution", survey_create: "AI Survey Creator", quick_chat: "Quick Assistant", weekly_summary: "Weekly Report Generator" };
    document.getElementById("chatTitle").textContent = titles[flow] || "AI Assistant";
    if (flow === "daily_report") startDailyReportWizard();
    else if (flow === "lesson_plan") startLessonPlanner();
    else if (flow === "student_support") startStudentWizard();
    else if (flow === "lab_help") startLabReporter();
    else if (flow === "survey_distribute") startSurveyDistribution();
    else if (flow === "survey_create") startSurveyCreator();
    else if (flow === "quick_chat") startQuickChat();
    else if (flow === "weekly_summary") startWeeklyGenerator();
}

function addChatBubble(role, text) {
    aiMessages.push({ role: role, content: text });
    var div = document.getElementById("chatMessages");
    var msg = document.createElement("div");
    msg.className = "chat-message " + role;
    var avatar = role === "ai" ? '<div class="message-avatar" style="background:#8b5cf6"><i class="fas fa-robot"></i></div>' : '<div class="message-avatar"><i class="fas fa-user"></i></div>';
    msg.innerHTML = avatar + '<div class="message-bubble">' + text.replace(/\n/g,"<br>").replace(/\*\*(.*?)\*\*/g,"<strong>$1</strong>") + "</div>";
    div.appendChild(msg); div.scrollTop = div.scrollHeight;
}

function showAIForm(html) {
    html += '<hr style="margin:8px 0"><div style="display:flex;gap:8px"><input type="text" id="customInput" class="form-control" placeholder="Type your own response..." style="flex:1"><button class="btn btn-outline btn-sm" onclick="submitCustomResponse()">Submit</button></div>';
    document.getElementById("aiFormArea").innerHTML = html;
}

function submitCustomResponse() {
    var input = document.getElementById("customInput"); if (!input || !input.value.trim()) return;
    var text = input.value.trim();
    if (currentAIFlow === "daily_report") { if (!reportData.streams) selectReportStreams([text]); else if (!reportData.netacad) nextReportStep("netacad", text); else if (!reportData.lab) nextReportStep("lab", text); else if (!reportData.centre) nextReportStep("centre", text); else if (!reportData.challenges) nextReportStep("challenges", text); else if (!reportData.recommendations) nextReportStep("recommendations", text); }
    else if (currentAIFlow === "lab_help") submitLabIssue(text);
    else if (currentAIFlow === "survey_create") generateAISurvey(text);
    else { addChatBubble("user", text); quickQuery(text); }
}

function startDailyReportWizard() { addChatBubble("ai", "**Step 1 of 6: Which streams did you work with today?**"); showAIForm('<div style="display:flex;flex-wrap:wrap;gap:8px"><button class="btn btn-outline" onclick="selectReportStreams([\'Love\'])">Love</button><button class="btn btn-outline" onclick="selectReportStreams([\'Joy\'])">Joy</button><button class="btn btn-outline" onclick="selectReportStreams([\'Peace\'])">Peace</button><button class="btn btn-outline" onclick="selectReportStreams([\'Mnara\'])">Mnara</button><button class="btn btn-primary" onclick="selectReportStreams([\'Love\',\'Joy\',\'Peace\',\'Mnara\'])">All Streams</button><button class="btn btn-outline" onclick="selectReportStreams([])">No Training Today</button></div>'); }
function selectReportStreams(streams) { reportData.streams = streams; if (streams.length === 0) { addChatBubble("ai", "**Step 2: What activity did you do?**"); showAIForm('<div style="display:flex;flex-wrap:wrap;gap:8px"><button class="btn btn-outline" onclick="nextReportStep(\'netacad\',\'Lab Maintenance\')">Lab Maintenance</button><button class="btn btn-outline" onclick="nextReportStep(\'netacad\',\'Administrative Work\')">Admin Work</button><button class="btn btn-outline" onclick="nextReportStep(\'netacad\',\'Meeting/Training\')">Meeting/Training</button></div>'); } else { addChatBubble("ai", "**Step 2: How was NETACAD training?**"); showAIForm('<div style="display:flex;flex-wrap:wrap;gap:8px"><button class="btn btn-success" onclick="nextReportStep(\'netacad\',\'Excellent - Students highly engaged\')">Excellent</button><button class="btn btn-outline" onclick="nextReportStep(\'netacad\',\'Good - Normal productive day\')">Good</button><button class="btn btn-outline" onclick="nextReportStep(\'netacad\',\'Had some challenges\')">Fair</button><button class="btn btn-warning" onclick="nextReportStep(\'netacad\',\'Did not go well\')">Poor</button></div>'); } }
function nextReportStep(field, value) { reportData[field] = value; if (field === "netacad") { addChatBubble("ai", "**Step 3: How was the lab?**"); showAIForm('<div style="display:flex;flex-wrap:wrap;gap:8px"><button class="btn btn-success" onclick="nextReportStep(\'lab\',\'Fully operational\')">Fully Operational</button><button class="btn btn-outline" onclick="nextReportStep(\'lab\',\'Mostly OK - minor issues\')">Mostly OK</button><button class="btn btn-warning" onclick="nextReportStep(\'lab\',\'Partial issues\')">Partial Issues</button><button class="btn btn-danger" onclick="nextReportStep(\'lab\',\'Major issues\')">Major Issues</button></div>'); } else if (field === "lab") { addChatBubble("ai", "**Step 4: Centre updates?**"); showAIForm('<div style="display:flex;flex-wrap:wrap;gap:8px"><button class="btn btn-success" onclick="nextReportStep(\'centre\',\'No issues\')">All Good</button><button class="btn btn-warning" onclick="nextReportStep(\'centre\',\'Power interruption\')">Power Issues</button><button class="btn btn-warning" onclick="nextReportStep(\'centre\',\'Internet problems\')">Internet Issues</button></div>'); } else if (field === "centre") { addChatBubble("ai", "**Step 5: Challenges?**"); showAIForm('<div style="display:flex;flex-wrap:wrap;gap:8px"><button class="btn btn-success" onclick="nextReportStep(\'challenges\',\'No major challenges\')">None</button><button class="btn btn-warning" onclick="nextReportStep(\'challenges\',\'Low attendance\')">Low Attendance</button><button class="btn btn-warning" onclick="nextReportStep(\'challenges\',\'Equipment failure\')">Equipment</button></div>'); } else if (field === "challenges") { addChatBubble("ai", "**Step 6: Recommendations?**"); showAIForm('<div style="display:flex;flex-wrap:wrap;gap:8px"><button class="btn btn-success" onclick="nextReportStep(\'recommendations\',\'Continue as planned\')">Continue</button><button class="btn btn-outline" onclick="nextReportStep(\'recommendations\',\'Extra revision needed\')">Extra Revision</button><button class="btn btn-outline" onclick="nextReportStep(\'recommendations\',\'Follow up attendance\')">Follow Up</button></div>'); } else { showReportSummary(); } }
function showReportSummary() { addChatBubble("ai", "**Report Summary**\n\nStreams: "+(reportData.streams.length>0?reportData.streams.join(", "):"None")+"\nNETACAD: "+reportData.netacad+"\nLab: "+reportData.lab+"\nCentre: "+reportData.centre+"\nChallenges: "+reportData.challenges+"\nRecommendations: "+reportData.recommendations); showAIForm('<div style="display:flex;gap:8px"><button class="btn btn-primary" onclick="saveDailyReport()">Save Report</button><button class="btn btn-outline" onclick="startDailyReportWizard()">Start Over</button></div>'); }
async function saveDailyReport() { try { showLoading(); await API.reports.saveDaily({ date: getToday(), streams: reportData.streams, topics_covered: reportData.netacad, challenges: reportData.challenges, next_steps: reportData.recommendations, engagement_level: reportData.netacad.includes("Excellent")?5:reportData.netacad.includes("Good")?4:3, status: "submitted" }); hideLoading(); addChatBubble("ai", "Report saved!"); showAIForm('<button class="btn btn-outline" onclick="navigateTo(\'reports\')">View Reports</button> <button class="btn btn-outline" onclick="resetAIFlow()">Main Menu</button>'); } catch(e) { hideLoading(); addChatBubble("ai", "Error: "+e.message); } }

async function startSurveyDistribution() {
    addChatBubble("ai", "**Survey Distribution Assistant**\n\nLoading student data...");
    try { showLoading(); var students = await API.students.getAll(); var surveys = await API.surveys.getAll(); hideLoading();
        var activeStudents = students.filter(function(s){return s.status==="active"&&s.email;});
        if (surveys.length === 0) { addChatBubble("ai", "No surveys found. Create one first."); showAIForm('<button class="btn btn-primary" onclick="navigateTo(\'surveys\')">Create Survey</button>'); return; }
        addChatBubble("ai", "Found **"+activeStudents.length+" active students** and **"+surveys.length+" surveys**.\n\nSelect a survey:");
        var html = '<div style="display:flex;flex-direction:column;gap:6px">';
        for (var i=0;i<surveys.length;i++) html += '<button class="btn btn-outline" onclick="selectSurveyToSend('+surveys[i].id+',\''+surveys[i].title+'\')">'+surveys[i].title+'</button>';
        html += '</div>'; showAIForm(html);
    } catch(e) { hideLoading(); }
}
async function selectSurveyToSend(surveyId, title) {
    try { showLoading(); var students = await API.students.getAll(); hideLoading();
        var activeStudents = students.filter(function(s){return s.status==="active"&&s.email;});
        addChatBubble("ai", "**Send: "+title+"**\n\nSelect stream:");
        showAIForm('<div style="display:flex;flex-wrap:wrap;gap:6px"><button class="btn btn-outline" onclick="sendSurveyToStream('+surveyId+',\'all\')">All Students ('+activeStudents.length+')</button><button class="btn btn-outline" onclick="sendSurveyToStream('+surveyId+',\'Love\')">Love</button><button class="btn btn-outline" onclick="sendSurveyToStream('+surveyId+',\'Joy\')">Joy</button><button class="btn btn-outline" onclick="sendSurveyToStream('+surveyId+',\'Peace\')">Peace</button><button class="btn btn-outline" onclick="sendSurveyToStream('+surveyId+',\'Mnara\')">Mnara</button></div>');
    } catch(e) { hideLoading(); }
}
async function sendSurveyToStream(surveyId, stream) {
    try { showLoading(); var students = await API.students.getAll(); hideLoading();
        var recipients = students.filter(function(s){return s.status==="active"&&s.email&&(stream==="all"||s.stream===stream);});
        var emails = recipients.map(function(s){return s.email;});
        var link = window.location.origin + "/surveys/" + surveyId;
        var mailto = "mailto:"+emails.join(",")+"?subject=Learner Feedback Survey&body=Dear Student,%0A%0APlease complete this survey:%0A"+encodeURIComponent(link)+"%0A%0AThank you!";
        addChatBubble("ai", "**Ready!** "+recipients.length+" students from "+(stream==="all"?"all streams":stream));
        showAIForm('<a href="'+mailto+'" target="_blank" class="btn btn-primary">Open Email Client</a> <button class="btn btn-outline" onclick="startSurveyDistribution()">Send Another</button>');
    } catch(e) { hideLoading(); }
}

function startSurveyCreator() {
    addChatBubble("ai", "**AI Survey Creator**\n\nWhat topic would you like a survey for? (e.g. 'Python Basics', 'End of module 2', 'Instructor Feedback')");
    showAIForm('');
}

async function generateAISurvey(topic) {
    addChatBubble("user", topic);
    addChatBubble("ai", "Generating survey for: **" + topic + "**...");
    try {
        showLoading();
        var r = await API.ai.generate({ conversation_type: "survey_generation", messages: [{ role: "user", content: topic }] });
        var surveyData = JSON.parse(r.response);
        await API.surveys.create({ title: surveyData.title, questions: surveyData.questions });
        hideLoading();
        
        var msg = "Survey created successfully!\n\n**" + surveyData.title + "**\n";
        for (var i=0; i<surveyData.questions.length; i++) {
            msg += (i+1) + ". " + surveyData.questions[i] + "\n";
        }
        addChatBubble("ai", msg);
        showAIForm('<button class="btn btn-outline" onclick="startSurveyCreator()">Create Another</button> <button class="btn btn-primary" onclick="navigateTo(\'surveys\')">View Surveys</button>');
    } catch (e) {
        hideLoading();
        addChatBubble("ai", "Sorry, there was an error generating the survey: " + e.message);
        showAIForm('<button class="btn btn-outline" onclick="startSurveyCreator()">Try Again</button>');
    }
}

async function startLessonPlanner() { addChatBubble("ai","Select a module:"); try { showLoading(); var c=await API.curriculum.get(); hideLoading(); var mods={};for(var i=0;i<c.length;i++){if(!mods[c[i].module_number])mods[c[i].module_number]=c[i].module_name;} var html='<div style="display:flex;flex-wrap:wrap;gap:6px">';for(var k in mods) html+='<button class="btn btn-outline btn-sm" onclick="selectLessonModule('+k+')">Module '+k+': '+mods[k].substring(0,30)+'</button>'; html+='</div>'; showAIForm(html); } catch(e) { hideLoading(); } }
async function selectLessonModule(m) { addChatBubble("ai","Generating plan for Module "+m+"..."); try { showLoading(); var r=await API.ai.generate({conversation_type:"lesson_plan",messages:[{role:"user",content:"Create lesson plan for Module "+m}]}); addChatBubble("ai",r.response); hideLoading(); showAIForm('<button class="btn btn-outline" onclick="startLessonPlanner()">Plan Another</button>'); } catch(e) { hideLoading(); } }
async function startStudentWizard() { try { showLoading(); var st=await API.performance.getStruggling(); hideLoading(); if(st.length===0){addChatBubble("ai","All students above 50%!");showAIForm('<button class="btn btn-outline" onclick="resetAIFlow()">Back</button>');return;} addChatBubble("ai","Found "+st.length+" struggling students:"); var html='<div style="display:flex;flex-direction:column;gap:4px">';for(var i=0;i<st.length;i++) html+='<button class="btn btn-outline btn-sm" onclick="addInterventionFor('+st[i].id+',\''+st[i].first_name+' '+st[i].last_name+'\')">'+st[i].first_name+' '+st[i].last_name+' ('+st[i].stream+') - '+parseFloat(st[i].avg_score).toFixed(1)+'%</button>'; html+='</div>'; showAIForm(html); } catch(e) { hideLoading(); } }
function addInterventionFor(id,name) { addChatBubble("ai","Intervention for "+name+":"); showAIForm('<div style="display:flex;flex-wrap:wrap;gap:6px"><button class="btn btn-outline" onclick="saveInterventionAI('+id+',\'Academic Support\')">Academic Support</button><button class="btn btn-outline" onclick="saveInterventionAI('+id+',\'Mentorship\')">Mentorship</button><button class="btn btn-outline" onclick="saveInterventionAI('+id+',\'Counseling\')">Counseling</button><button class="btn btn-outline" onclick="saveInterventionAI('+id+',\'Extra Classes\')">Extra Classes</button></div>'); }
async function saveInterventionAI(id,type) { try { showLoading(); await API.performance.createIntervention({student_id:id,type:type,description:type+" via AI",priority:"high"}); hideLoading(); addChatBubble("ai","Intervention saved!"); showAIForm('<button class="btn btn-outline" onclick="startStudentWizard()">Back</button>'); } catch(e) { hideLoading(); } }
async function startLabReporter() { try { showLoading(); var s=await API.lab.getStatus(); hideLoading(); addChatBubble("ai","Lab health: "+(s.summary?s.summary.health_percentage:"N/A")+"%"); showAIForm('<div style="display:flex;flex-wrap:wrap;gap:6px"><button class="btn btn-outline" onclick="reportLabIssue(\'workstation\')">Report Workstation</button><button class="btn btn-outline" onclick="reportLabIssue(\'laptop\')">Report Laptop</button><button class="btn btn-outline" onclick="navigateTo(\'lab\')">View Lab</button></div>'); } catch(e) { hideLoading(); } }
function reportLabIssue(type) { reportData.deviceType=type; addChatBubble("ai","Select issue:"); showAIForm('<div style="display:flex;flex-wrap:wrap;gap:6px"><button class="btn btn-outline" onclick="submitLabIssue(\'Not powering on\')">Not Powering On</button><button class="btn btn-outline" onclick="submitLabIssue(\'Display issues\')">Display Issues</button><button class="btn btn-outline" onclick="submitLabIssue(\'Keyboard/mouse\')">Keyboard/Mouse</button><button class="btn btn-outline" onclick="submitLabIssue(\'Network\')">Network</button></div>'); }
async function submitLabIssue(issue) { try { showLoading(); await API.lab.addMaintenance({device_type:reportData.deviceType,device_id:1,issue_description:issue,priority:"medium"}); hideLoading(); addChatBubble("ai","Issue reported!"); showAIForm('<button class="btn btn-outline" onclick="startLabReporter()">Report Another</button>'); } catch(e) { hideLoading(); } }
function startQuickChat() { addChatBubble("ai","Ask me anything!"); showAIForm('<div style="display:flex;flex-wrap:wrap;gap:6px"><button class="btn btn-outline btn-sm" onclick="quickQuery(\'Show struggling students\')">Struggling Students</button><button class="btn btn-outline btn-sm" onclick="quickQuery(\'Today attendance?\')">Attendance</button><button class="btn btn-outline btn-sm" onclick="quickQuery(\'Show lab health\')">Lab Status</button><button class="btn btn-outline btn-sm" onclick="quickQuery(\'Generate weekly report\')">Weekly Report</button></div>'); }
async function quickQuery(q) { addChatBubble("user",q); try { showLoading(); var r=await API.ai.generate({conversation_type:"quick_chat",messages:[{role:"user",content:q}]}); addChatBubble("ai",r.response); hideLoading(); } catch(e) { hideLoading(); } }
function startWeeklyGenerator() { addChatBubble("ai","Select week:"); var d=new Date();var m=new Date(d);m.setDate(d.getDate()-d.getDay()+1);var s=new Date(m);s.setDate(m.getDate()+6); showAIForm('<button class="btn btn-primary" onclick="generateWeeklyReport(\''+m.toISOString().split("T")[0]+'\',\''+s.toISOString().split("T")[0]+'\')">This Week</button><button class="btn btn-outline" onclick="generateWeeklyReport(\''+new Date(m.getTime()-7*86400000).toISOString().split("T")[0]+'\',\''+new Date(s.getTime()-7*86400000).toISOString().split("T")[0]+'\')">Last Week</button>'); }
async function generateWeeklyReport(s,e) { try { showLoading(); var dr=await API.reports.getDaily(); var wr=dr.filter(function(r){return r.date>=s&&r.date<=e;}); var summary=wr.map(function(r){return r.topics_covered;}).join(" | "); await API.reports.createWeekly({week_start_date:s,week_end_date:e,netacad_update:summary||"See daily reports",lab_update:"Operational",centre_update:"See daily reports",challenges:"See daily reports",recommendations:"See daily reports",status:"submitted"}); hideLoading(); addChatBubble("ai","Weekly report generated!"); showAIForm('<button class="btn btn-outline" onclick="navigateTo(\'reports\')">View Reports</button>'); } catch(e) { hideLoading(); } }
function resetAIFlow() { currentAIFlow="";aiMessages=[];reportData={};document.getElementById("flowSelector").style.display="grid";document.getElementById("chatArea").style.display="none";document.getElementById("chatMessages").innerHTML=""; }
