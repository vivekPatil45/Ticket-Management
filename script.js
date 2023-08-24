// console.log("linked")

let addbtn= document.querySelector(".add-btn");
let removebtn=document.querySelector(".remove-btn");
let modelcont= document.querySelector(".model-cont");
let maincont=document.querySelector(".main-cont");
let textareacont=document.querySelector(".texarea-cont")
let toolBoxColors = document.querySelectorAll(".color");
let allPriorityColors = document.querySelectorAll(".priority-color");


let colors= ["lightpink","lightblue","lightgreen","black"];
let modelPriorityColor = colors[colors.length-1];

let addflag=false;
let removeflag=false;

let lockClass = "fa-lock";
let unlockClass = "fa-lock-open";

let ticketsArr = [];

if(localStorage.getItem("Jira_ticket")){
    // Retrieve and display tickets
    ticketsArr =JSON.parse(localStorage.getItem("Jira_ticket"));
    ticketsArr.forEach((ticketObj)=>{
        createTicket(ticketObj.ticketColor, ticketObj.ticketTask, ticketObj.ticketId);
    })
}


for(let i=0;i<toolBoxColors.length;i++){

    toolBoxColors[i].addEventListener("click",(e)=>{
        let currentToolBoxColor = toolBoxColors[i].classList[0];

        let filteredTickets =ticketsArr.filter((ticketObj,idx)=>{
            return currentToolBoxColor === ticketObj.ticketColor;
        })

        // Remove previous tickets
        let allTicketsCont=document.querySelectorAll(".ticket-cont");
        for (let i = 0; i < allTicketsCont.length; i++) {
            allTicketsCont[i].remove();
        }

        // Display new filtered tickets
        filteredTickets.forEach((ticketObj, idx) => {
            createTicket(ticketObj.ticketColor, ticketObj.ticketTask, ticketObj.ticketId);
        })
    })

    toolBoxColors[i].addEventListener("dblclick",(e)=>{
        // Remove previous tickets
        let allTicketsCont=document.querySelectorAll(".ticket-cont");
        for (let i = 0; i < allTicketsCont.length; i++) {
            allTicketsCont[i].remove();
        }

        ticketsArr.forEach((ticketObj,idx)=>{
            createTicket(ticketObj.ticketColor, ticketObj.ticketTask, ticketObj.ticketId);
        })
    })

}


//listener for model priority coloring
allPriorityColors.forEach((colorElem,idx)=>{
    colorElem.addEventListener("click",(e)=>{
        allPriorityColors.forEach((prioriryColorElem,idx)=>{
            prioriryColorElem.classList.remove("border");
        })
        colorElem.classList.add("border");

        modelPriorityColor=colorElem.classList[1];
        console.log(modelPriorityColor);

    })
})

addbtn.addEventListener("click",(e)=>{
    // console.log("linked")
    //display model
    //genrate ticket
    

    //addflag==true -> display model
    //addflag==false -> no display model
    addflag = !addflag;
    if(addflag){
        modelcont.style.display="flex";
    }else{
        modelcont.style.display="none";
    }
})
removebtn.addEventListener("click",(e)=>{
    removeflag = !removeflag;
})


modelcont.addEventListener("keydown",(e)=>{
    // createTicket();
    // console.log(e.code);
    let key= e.key;
    if(key === "Shift"){
        createTicket(modelPriorityColor,textareacont.value);
        addflag=false;
        setModalToDefault();
    }
})

function createTicket(ticketColor,ticketTask,ticketId){
    let id= ticketId || shortid();
    let ticketcont=document.createElement("div");
    ticketcont.setAttribute("class","ticket-cont");
    ticketcont.innerHTML= `
        <div class="ticket-color ${ticketColor}"></div>
        <div class="ticket-id">#${id}</div>
        <div class="task-area">${ticketTask}</div>
        <div class="ticket-lock">
            <i class="fa-solid fa-lock"></i>
        </div>
    `;

    // let stt="vivek ${}"

    maincont.appendChild(ticketcont);

    // Create object of ticket and add to array

    if(!ticketId){

        ticketsArr.push({ ticketColor, ticketTask, ticketId: id });
        localStorage.setItem("Jira_ticket",JSON.stringify(ticketsArr));
    }
    console.log(ticketsArr)


    handleRemoval(ticketcont,id);
    handleLock(ticketcont,id);
    handleColor(ticketcont,id);
    
}

function handleRemoval(ticket,id){
     // removeFlag -> true -> remove
     
    ticket.addEventListener("click",(e)=>{
        if (!removeflag) return;

        let idx = getTicketIdx(id);

        // DB removal
        ticketsArr.splice(idx, 1);

        let strTicketsArr = JSON.stringify(ticketsArr);
        localStorage.setItem("Jira_ticket", strTicketsArr);

        ticket.remove(); //UI removal
    })
}

function handleLock(ticket,id){
    let ticketLockElem = ticket.querySelector(".ticket-lock");
    let ticketLock = ticketLockElem.children[0];
    let ticketTaskArea = ticket.querySelector(".task-area");

    ticketLock.addEventListener("click",(e)=>{
        let ticketIdx = getTicketIdx(id);

        if (ticketLock.classList.contains(lockClass)) {
            ticketLock.classList.remove(lockClass);
            ticketLock.classList.add(unlockClass);
            ticketTaskArea.setAttribute("contenteditable", "true");
        }
        else {
            ticketLock.classList.remove(unlockClass);
            ticketLock.classList.add(lockClass);
            ticketTaskArea.setAttribute("contenteditable", "false");
        }

        // Modify data in localStorage (Ticket Task)
        ticketsArr[ticketIdx].ticketTask = ticketTaskArea.innerText;
        localStorage.setItem("Jira_ticket", JSON.stringify(ticketsArr));
    })
}
function handleColor(ticket,id){
    let ticketColor = ticket.querySelector(".ticket-color");
    ticketColor.addEventListener("click",(e)=>{
         // Get ticketIdx from the tickets array
        let ticketIdx = getTicketIdx(id);

        let currentTicketColor = ticketColor.classList[1];
        // Get ticket color idx
        let currentTicketColorIdx= colors.findIndex((color)=>{

            return currentTicketColor === color;
        })
        currentTicketColorIdx++;
        let newTicketColorIdx = currentTicketColorIdx % colors.length;
        let newTicketColor = colors[newTicketColorIdx];
        ticketColor.classList.remove(currentTicketColor);
        ticketColor.classList.add(newTicketColor);


        // Modify data in localStorage (priority color change)
        ticketsArr[ticketIdx].ticketColor = newTicketColor;
        localStorage.setItem("Jira_ticket", JSON.stringify(ticketsArr));

    })

}

function getTicketIdx(id){
    let ticketIdx = ticketsArr.findIndex((ticketObj) => {
        return ticketObj.ticketId === id;
    })
    return ticketIdx;
}

function setModalToDefault() {
    modelcont.style.display = "none";
    textareacont.value = "";
    modelPriorityColor = colors[colors.length - 1];
    allPriorityColors.forEach((priorityColorElem, idx) => {
        priorityColorElem.classList.remove("border");
    })
    allPriorityColors[allPriorityColors.length - 1].classList.add("border");
}