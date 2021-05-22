## Lingo Client

### Prod;
- [Client Service](https://karuhanga.github.io/lingo-client/taskpane.html)

### To run;
- (If on mac) run `npm run dev-server`
- Run `npm start`

### Helpful links;
- Access console logs: https://docs.microsoft.com/en-us/office/dev/add-ins/testing/debug-office-add-ins-on-ipad-and-mac
- 

### Pending;
- move words to infinite scroll
- improve auto refresh, performance compromise- right now, we have to choose one- auto refresh/ view more words

### Nice to have;
- Use indexed db fixes(investigate https://www.npmjs.com/package/react-indexed-db-hooks)
- Ignore word for this doc

### Architecture
![alt text](./designNotes/architecture.png)

### Bootstrapped by
This repository contains the source code used by the [Yo Office generator](https://github.com/OfficeDev/generator-office) when you create a new Office Add-in that appears in the task pane. You can also use this repository as a sample to base your own project from if you choose not to use the generator. 

### Debugging
This template supports debugging using any of the following techniques:

### Relevant Links
- [Tutorial](https://docs.microsoft.com/en-us/office/dev/add-ins/tutorials/word-tutorial)
- [Use a browser's developer tools](https://docs.microsoft.com/office/dev/add-ins/testing/debug-add-ins-in-office-online)
- [Attach a debugger from the task pane](https://docs.microsoft.com/office/dev/add-ins/testing/attach-debugger-from-task-pane)
- [Use F12 developer tools on Windows 10](https://docs.microsoft.com/office/dev/add-ins/testing/debug-add-ins-using-f12-developer-tools-on-windows-10)
