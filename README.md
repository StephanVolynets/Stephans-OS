# DESKTOP Environment Portfolio Project :art:

## Overview

**My project** is an interactive, web based desktop operating system environment built as a portfolio project, drawing inspiration from Dustin Brett’s **daedalOS**. It demonstrates a wide range of frontend and systems programming skills, focusing on a blend of user experience, scalability, and optimization. The goal is to emulate desktop like functionality, providing a platform where users can interact with applications, files, and features within a web browser.

<h1 align="center">Snapshot</h1>

<p>
   <img src="https://github.com/user-attachments/assets/82744500-eb26-4e6d-87cf-40a7f2cbdfc7" alt="Desktop Browser" style="width:100% height="700">
        <br>

</p>

 <p align="center">
    <img src="https://github.com/user-attachments/assets/581b8f41-2b95-4c60-bcca-da9b1f6fb39d" alt="Desktop Browser"  width="300" >
     
 </p>


   

## Technologies Used

  **TypeScript**: Strongly typed, good for scalable and maintainable code.
  **React/Next.js**: For dynamic rendering and routing.
  **CSS (with custom animations)**: Used to style and create animations for the desktop environment.
  **Framer Motion**: For fluid animations and transitions.
  **TINYmce**: A WYSIWYG text editor for file editing.
  **React Calendar**: Calendar interface with event management capabilities.
  **IndexedDB (Planned)**: Persistent client side storage for the file system.
  **ZenFS (Exploring)**: Considering integration with ZenFS for a more robust file system emulation.

   

## Project Features and Logic

### User Interface Components

  **Desktop Grid**: Users can select and drag icons using an optimized grid system with click detection and dynamic styling.
  **Taskbar**: Displays active windows, offering quick access to applications.
  **Start Menu**: Application launcher providing easy access to built in programs and system settings.
  **Context Menus**: Right click context menus dynamically adapt to desktop or icon interactions, mimicking operating system behavior.

   

## Applications & Features

1. **File Explorer**  
     Browse and manage files within a virtual directory system.
     Supports drag and drop, icon rearrangement, and future indexed storage.

2. **Text Editor (TINYmce)**  
     Feature rich editor with options for formatting and file saving.

3. **Calendar (react calendar)**  
     Intuitive date and event tracking interface.

4. **Web Browser (Basic Implementation)**  
     Simple built in browser for accessing web pages (expandable).

5. **Terminal (Planned)**  
     Bash like shell interface to execute command line tasks.

   

## Optimization Efforts (death of me :sweat_smile:)

  **Window Management System**  
   Efficient handling of window focus, stacking (z index), resizing, and animations. Optimized state updates to minimize re rendering.

  **Icon Selection & Highlighting**  
   Custom selection box supports both drag and multi select functionality, optimized for performance through debouncing.

  **Event Handling**  
   Uses efficient event listeners and throttling techniques to ensure responsiveness.

  **State Management**  
   State consistency across multiple components is achieved through TypeScript's strict type system and optimized hooks.

   

### Current Progress

  Implemented core desktop UI and basic applications.
  Developed a dynamic window management system.
  Integrated selection and drag and drop features.
  Context aware right click menus with adaptive options.
  
   

## Future Implementations

  **Persistent File System**  
   Integration of **IndexedDB** to maintain files across sessions, allowing persistent storage of user created files.

  **Bash Terminal Emulation**  
   Adding a functional shell for executing basic commands and file manipulation tasks.

  **ZenFS Integration** (Research Ongoing)  
   Potential use of ZenFS to enhance file system operations.

   

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
