# Stephan's OS :desktop_computer:

[![Netlify Status](https://api.netlify.com/api/v1/badges/ab3bb5b6-b35e-4b94-976b-b5f3f4a99ed2/deploy-status)](https://app.netlify.com/sites/stephos/deploys)

## Overview

**Stephan's OS** is an interactive, web based desktop operating system environment built as a portfolio project. Inspired by Dustin Brett’s **daedalOS** and other innovative projects, it showcases a wide range of web technologies and functionalities. The project aims to provide a seamless and immersive OS experience directly in the browser, supporting various applications and widgets with persistent client side storage capabilities.

## Resources & Inspirations

- **File System Functionality**: Utilizes the Origin Private File System (OPFS) API, providing secure and private storage. Learn more from [MDN](https://developer.mozilla.org/en-US/docs/Web/API/File_System_API/Origin_private_file_system).
  
- **[Dustin Brett’s daedalOS](https://dustinbrett.com/)**: A web based desktop experience that heavily inspired this project.
  
- **[Linuxontheweb](https://linuxontheweb.github.io/)**: A web based Linux environment. This project is inspired by the idea that modern browsers now offer a programmatically accessible file system within domain-specific "sandboxes," resembling a virtual machine (VM) environment. The "VM" incrementally loads the various parts of the guest OS from a backend service (local or remote) in response to the user's immediate requirements. This approach allows users to transcend traditional web page experiences and engage with a more dynamic and powerful environment.
  
- **[AaronOS](https://github.com/MineAndCraft12/AaronOS)**: Another web based OS project that influenced the development of Stephan's OS.

## Snapshot

![Desktop Browser](https://github.com/user-attachments/assets/deb076e0-9d74-41bd-98c4-151e4a3598f9)

## Technologies Used

- **TypeScript**: Provides strong typing for scalable and maintainable code.
- **React/Next.js**: Facilitates dynamic rendering and routing.
- **CSS Custom Animations**: Used to style and animate the desktop environment.
- **Framer Motion**: For fluid animations and transitions.
- **TINYmce**: A WYSIWYG text editor for file editing.
- **React Calendar**: Calendar interface with event management capabilities.
- **OPFS**: Provides private storage endpoints as part of the File System API.
- **IndexedDB**: For storing and retrieving data within the browser.

## Project Features and Logic

### User Interface Components

- **Desktop Grid**: Users can select and drag icons using an optimized grid system with click detection and dynamic styling.
- **Taskbar**: Displays active windows, offering quick access to applications.
- **Start Menu**: Application launcher providing easy access to built in programs and system settings.
- **Context Menus**: Right click context menus dynamically adapt to desktop or icon interactions, mimicking operating system behavior.

## Applications & Features

1. **File Manager + Explorer**
   - Browse and manage files within a virtual directory system.
   - Supports drag and drop, icon rearrangement, and future indexed storage.

2. **Code Indexer**
   - Index and search functionality for all files cached.

3. **Text Editor**
   - Feature rich editor with options for formatting and file saving.

4. **Web Browser**
   - Built in browser for accessing web pages (expandable).

5. **Calendar (with event planner)**
   - Intuitive date and event tracking interface.

6. **Weather App**
   - Provides real time weather data from any city in the world.

7. **Terminal (Planned)**
   - Bash like shell interface to execute command line tasks.

8. **Memory Game**
   - Find matching pairs of emojis in the fewest moves possible, keeps track of best score.

9. **Calculator**
   - Basic arithmetic and advanced calculations.

## File System and Icon Persistence

Stephan's OS uses the Origin Private File System (OPFS) API for secure, client side storage. This ensures that all user data, including files and icon placements, persist across sessions without server-side dependencies. This means users can store anything within the OS environment, and it will remain private and inaccessible to others, including the developers.

### Key Features:
- **Persistent Storage**: Files and settings are stored securely using OPFS and IndexedDB.
- **Icon Persistence**: Icon positions and states remain consistent across sessions, ensuring a personalized user experience.
- **Privacy**: All data is stored client side, meaning no external access to user data.

## Optimization Efforts

1. **Window Management System**
   - Efficient handling of window focus, stacking (z-index), resizing, and animations.
   - Optimized state updates to minimize rerendering.

2. **Icon Selection & Highlighting**
   - Custom selection box supports both drag and multiselect functionality, optimized for performance through debouncing.

3. **Event Handling**
   - Uses efficient event listeners and throttling techniques to ensure responsiveness.

4. **State Management**
   - State consistency across multiple components is achieved through TypeScript's strict type system and optimized hooks.
  
## Detailed Logic for Windows and Resizing

Implementing and optimizing the window management system was a significant effort, focusing on both performance and user experience. Here are the technical details:

### Window Management
- **Focus and Stacking**: Windows are managed using a z-index system to ensure the active window is always on top. This involves dynamic adjustments to the z-index property based on user interactions.
- **Resizing and Dragging**: Windows support drag-and-drop and resizing operations. These operations are handled via event listeners that track mouse movements and adjust window dimensions and positions accordingly.
- **State Management**: Each window's state (position, size, z-index) is managed using React's state hooks, ensuring efficient updates and re-renders only when necessary.

### Performance Optimizations
- **Debouncing and Throttling**: Event listeners for window dragging and resizing are optimized using debouncing and throttling techniques to reduce the frequency of state updates and improve performance.
- **Minimized Re-renders**: State updates are batched and optimized to prevent unnecessary re-renders, leveraging React's reconciliation algorithm to maintain smooth performance.
- **CSS Transitions**: Smooth transitions and animations for window movements and resizing are achieved using CSS transitions, which offload work to the GPU and enhance performance.

## Recent Changes

- **March 18, 2025**: Implemented CPU, FPS, and Battery widgets for realtime system monitoring in the taskbar.
  - CPU Widget displays current CPU usage based on FPS metrics.
  - FPS Widget tracks and displays frames per second with color coded performance indicators.
  - Battery Widget shows battery level and charging status using the Battery Status API.
  - Integrated widgets into the taskbar for improved user experience.
- **March 18, 2025**: Developed the Browser component with enhanced functionality for Google searches and iframe handling.
- **March 18, 2025**: Updated the Code Indexer component for better codebase navigation and display.
- **March 18, 2025**: Improved taskbar layout to accommodate new widgets and maintain usability.
- **March 18, 2025**: Refined styling and responsiveness across components for a cohesive look.
- **March 18, 2025**: Fixed various bugs related to window management and application launching.

For more details on the recent commits, visit the [commit history](https://github.com/StephanVolynets/Stephans-OS/commits).

## Getting Started

### Clone the Repository:
```bash
git clone https://github.com/StephanVolynets/Stephans-OS.git
```

### Navigate to the Project Directory:
```bash
cd Stephans-OS
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

This project was inspired by **Dustin Brett's** innovative **daedalOS** desktop emulation. Special thanks to open source communities for tools like **TINYmce**, **react calendar**, and others.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more details.

---
