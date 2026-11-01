const list = document.querySelector("#tasklist ul");
const input = document.querySelector("#taskform input");
const form = document.querySelector("#taskform");
const todaylink=document.querySelector("#today");
const tmrlink=document.querySelector("#tomorrow");
const schlink=document.querySelector("#schedule");
const selectedDate=document.querySelector("#chooseDate");
const dateToShow=document.querySelector("#dateToShow");
const search=document.querySelector("#searchbar");
const searchInput = document.querySelector("#searchbar input[type='search']");

const tasks = [];
let currentDate=new Date().toISOString().split("T")[0];
let isSearching=false;

let nextId = 1;

function showNormalView() {
    document.querySelector("#taskform").style.display = "block";
}

function createTaskElement(task){ //creates <li>,chrckbox,title,edit button,delete button and their event listeners
    const listItem = document.createElement("li");
    const listText = document.createElement("span");
    const listBtn_edit = document.createElement("button");
    const listBtn_delete = document.createElement("button");
    const checkBox = document.createElement("input");
    checkBox.type = "checkbox";
    checkBox.checked=task.is_completed;
    if(task.is_completed){
        listText.style.textDecoration="line-through";
    }
    else{
        listText.style.textDecoration="none";
    }

    listItem.appendChild(checkBox);
    listItem.appendChild(listText);
    listText.textContent = task.title;

    if(isSearching){
        const listDate=document.createElement("small");
        listDate.textContent = " (" + task.date + ")";
        listItem.appendChild(listDate);
    }

    listItem.appendChild(listBtn_edit);
    listBtn_edit.textContent = "Edit";

    listItem.appendChild(listBtn_delete);
    listBtn_delete.textContent = "Delete";

    list.appendChild(listItem);

    // Mark task as completed or unfinished
    checkBox.addEventListener("change", () => {
        task.is_completed = checkBox.checked;
        if(task.is_completed){
            listText.style.textDecoration="line-through";
        }
        else{
            listText.style.textDecoration="none"; //when a completed task is unchecked
        }
    });

    // Delete task
    listBtn_delete.addEventListener("click", () => {
        const taskIndex = tasks.findIndex((item) => item.id === task.id);

        if (taskIndex !== -1) {
            tasks.splice(taskIndex, 1);
        }

        list.removeChild(listItem);
    });

    // Edit task
    listBtn_edit.addEventListener("click", () => {
        const edit_task = prompt("Edit task...", task.title);

        if (edit_task !== null && edit_task.trim() !== "") {
            task.title = edit_task;
            listText.textContent = task.title;
        }
    });
}

function renderTasks(){
    list.textContent="";
    for(const task of tasks){
        if(task.date===currentDate){
            createTaskElement(task);
        }
    }
}

form.addEventListener("submit", (event) => {
    event.preventDefault();

    const myItem = input.value;

    if(currentDate===""){
        alert("Enter a date");
    }
    else if (myItem.trim() !== "") {

        // Create a task object
        const task = {
            id: nextId,
            title: myItem,
            date: currentDate,
            is_completed: false
        };

        nextId++;

        // Store the task object in the array
        tasks.push(task);

        input.value = "";
        renderTasks();
        
    }

    input.focus();
});

showNormalView();
dateToShow.textContent=currentDate; //by default show today's date
todaylink.addEventListener("click",(event)=>{
    event.preventDefault();
    showNormalView();
    document.querySelector("#chooseDateSchedule").style.display = "none";//preventing display of date picker
    currentDate=new Date().toISOString().split("T")[0];
    dateToShow.textContent=currentDate;
    renderTasks();
});

tmrlink.addEventListener("click", (event) => {
    event.preventDefault();

    showNormalView();
    document.querySelector("#chooseDateSchedule").style.display = "none";
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    currentDate = tomorrow.toISOString().split("T")[0];
    dateToShow.textContent=currentDate;

    renderTasks();
});

schlink.addEventListener("click",(event)=>{
    event.preventDefault();
    showNormalView();
    document.querySelector("#chooseDateSchedule").style.display = "block";
    currentDate=selectedDate.value;
    dateToShow.textContent=currentDate;
    renderTasks();
});

selectedDate.addEventListener("change",()=>{
    currentDate=selectedDate.value;
    dateToShow.textContent=currentDate;
    renderTasks();
});

search.addEventListener("submit",(event)=>{
    event.preventDefault();
    isSearching=true;
    list.textContent="";
    dateToShow.textContent="Search Results...";
    document.querySelector("#chooseDateSchedule").style.display = "none";
    document.querySelector("#taskform").style.display = "none";

    for(const task of tasks){
        if(task.title.toLowerCase().includes(searchInput.value.toLowerCase())){
            createTaskElement(task);
        }
    }
    isSearching=false;
});

