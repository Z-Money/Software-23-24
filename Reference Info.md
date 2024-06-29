482731 - T732@S7
719354 - T531@S5
192845 - T914@S9
374829 - T429@S4
568247 - T428@S4

Talk about app collaborative task manager + technology used (Vanilla js frontend, nodejs backend, mongodb database). Created web app to allow use of program anywhere.
Login leveraged bcrypt, nodejs library to create secure hashed passwords. Login process done server side for increased security.
Profile -> Calendar -> TaskBoard -> Team members -> Events
Here is the general dashboard where the user can see any information they might need to know about their events

Profile:
Here the user can see all their information, such as what events they're registered for, the conferences they've attended, and more.
*Open profile*

Calendar:
The user can see any upcoming due dates and events, and can expand the calendar to be full screen for better viewing. The user can also add and edit events to the calendar from here.
*Open calendar, look at events, click to add event, edit event*

Task Board:
Here are all the task the user is assigned to across all their events. There are 3 categories to sort the completion status of each task. On each task-card, the user can see the task to complete, the due date, who is assigned to that task, and which event the task is for. The user can click on a task-card to edit any information about the task, such as the name, due date, assigned members, and completion status. On this popup, the user can also delete the task. These changes are sent to the server to update the database, allowing for instant changes reflected on both the user's device and any other device they or a teammate signs in on. The user can also add any task they want to by scrolling down and clicking the add task button.
*Hover over each column, scroll to bottom, hover over task-card info, click on task-card, edit name, event, status, update task. Then delete task. Create task.*

Team Members:
A list of all the members who share an event with the user, and a list of all the events they share together
*Hover over name and event tags, scroll to bottom*

Events:
The last section of the general dashboard are 4 tiles of the events the user is registered for. Each tile has a unique image tailored to that event, and when clicked takes you to the event dashboard.
*Hover over each tile, then click on chapter team*

Event Dashboard:
This page is the event dashboard, where users can see a compilation of all the information about their event in 1 place. All of the information on this page is dynamically from the server, allowing for a singular page to be used instead of one for each page. The completion progress circle is calculated based on the tasks completed, and updated dynamically whenever you update or add a task. The user can see the same calendar from the general dashboard here as well to be aware of any upcoming due dates or events. This dashboard also includes a list of all team members for the event, along with what year they're in and their email address. The user can also chat with other members on the event. This chat includes real-time updates, so chats done on one device automatically show up on others. This chat features replies to other's chats and reactions to chats. It also has channels for each event and a general channel for the entire chapter to communicate with.
*Hover over progress circle, show how tasks update it, hover over calendar/make full screen, scroll down team members, hover over name, year, and email, show discussion, make full screen, send chat, reply and react to it*