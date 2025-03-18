# DESKTOP Environment Portfolio Project :art: 
[![Netlify Status](https://api.netlify.com/api/v1/badges/ab3bb5b6-b35e-4b94-976b-b5f3f4a99ed2/deploy-status)](https://app.netlify.com/sites/stephos/deploys)
## Overview

**My project** is an interactive, web based desktop operating system environment built as a portfolio project, drawing inspiration from Dustin Brett’s **daedalOS**. It demonstrates a wide range of frontend and systems programming skills, focusing on a blend of user experience, scalability, and optimization. The goal is to emulate desktop like functionality, providing a platform where users can interact with applications, files, and features within a web browser.

## Resources & Inspirations (Check them out!)
- File System Functionality uses the Origin Private File System (OPFS) API, read more [here](https://developer.mozilla.org/en-US/docs/Web/API/File_System_API/Origin_private_file_system) and [here](https://rxdb.info/rx-storage-opfs.html)
- [Dustin Brett’s daedalOS](https://dustinbrett.com/) - A web-based desktop experience that inspired this project.
-  [Linuxontheweb](https://linuxontheweb.github.io/) - A web-based Linux environment. Learn more about it [here](https://linuxontheweb.github.io/www/docs/what-it-is.html).
- [AaronOS](https://github.com/MineAndCraft12/AaronOS)
  
<h1 align="center">Snapshot</h1>
<p>
   <img src="https://github.com/user-attachments/assets/cf5d2120-38fb-429c-8e93-71347a8b4387" alt="Desktop Browser" style="width:100% height="700">
        <br>

</p>

 

## Technologies Used

 ° **TypeScript**: Strongly typed, good for scalable and maintainable code.
 
 ° **React/Next.js**: For dynamic rendering and routing.
 
 ° **CSS custom animations**: Used to style and create animations for the desktop environment.
  
 ° **Framer Motion**: For fluid animations and transitions.
 
 ° **TINYmce**: A WYSIWYG text editor for file editing.
 
 ° **React Calendar**: Calendar interface with event management capabilities.
  
 ° **IndexedDB (Planned)**: Persistent client side storage for the file system.
  

   

## Project Features and Logic

### User Interface Components

  **Desktop Grid**: Users can select and drag icons using an optimized grid system with click detection and dynamic styling.
  **Taskbar**: Displays active windows, offering quick access to applications.
  **Start Menu**: Application launcher providing easy access to built in programs and system settings.
  **Context Menus**: Right click context menus dynamically adapt to desktop or icon interactions, mimicking operating system behavior.

   

## Applications & Features

1. **File Manager + Explorer**  
     Browse and manage files within a virtual directory system.
     Supports drag and drop, icon rearrangement, and future indexed storage.
   
2. **Code Indever**
     Index and Search Functionality for all files cached.****

3. **Text Editor**  
     Feature rich editor with options for formatting and file saving.
   
4. **Web Browser**  
     Built in browser for accessing web pages (expandable).

5. **Calendar (with event planner)**  
     Intuitive date and event tracking interface.
   
6. **Weather App**
     Precise real time weather data from any city in the world

7. **Terminal (Planned)**  
     Bash like shell interface to execute command line tasks.

8. **Memory Game**
   Find matching pairs of emojis in the fewest moves possible, keeps track of best score.
   
9. **Calculator**

   

## Optimization Efforts (death of me :sweat_smile:)

  **Window Management System**  
   Efficient handling of window focus, stacking (z index), resizing, and animations. Optimized state updates to minimize re rendering.

  **Icon Selection & Highlighting**  
   Custom selection box supports both drag and multi select functionality, optimized for performance through debouncing.

  **Event Handling**  
   Uses efficient event listeners and throttling techniques to ensure responsiveness.

  **State Management**  
   State consistency across multiple components is achieved through TypeScript's strict type system and optimized hooks.


### Current Core Progress

  Implemented core desktop UI and basic applications.
  Developed a dynamic window management system.
  Integrated selection and drag and drop features.
  Context aware right click menus with adaptive options.
  
   

# Future Implementations

  ### Bash Terminal Emulation
  ---
   - Adding a functional shell for executing basic commands and file manipulation tasks.

  ### Binary Viewer | Converter (BIN)
  ---

  ### Javescript Console (jsC)
  ---

  ### CPU Monitor
  ---
  - Estimated by comparing the current FPS to the record high FPS within the session.

  ### Eruda DevTools (ERD)
  ---
  - [Read More](https://github.com/liriliri/eruda)

  ### Properties Viewer (PPT)
  ---
  
  ### JS Paint

  ---


## Getting Started

### Clone the Repository:
```bash
git clone https://github.com/StephanVolynets/DESKTOP.git
```

### Navigate to the Project Directory:
```bash
cd DESKTOP
```

### Install Dependencies:
```bash
npm install
```

### Run the Development Server:
```bash
npm run dev
```

### Open the application:
Navigate to `http://localhost:3000` in your web browser to interact with the desktop environment.

   

## Contributing

Contributions are encouraged! Feel free to open issues or submit pull requests for bug fixes, features, or performance improvements.

   

## Acknowledgments

This project was inspired by **Dustin Brett's** innovative **daedalOS** desktop emulation. Special thanks to open source communities for tools like **TINYmce**, **react calendar**, **ZenFS**, and **Framer Motion** that enhance this project.

   

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more details.
