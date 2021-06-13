## Design Document

Below is the folder structure that we want to follow for the future of the project

```
---public/
    -- fonts/  //all the publicly used fonts can be kept here
    -- images/ // all the publicly used images can be kept here

---src/
    -- index.js
    -- App.jsx // this will contain the providers and state containers
    -- global_styling // This folder will contain the global styling and a variable folde
      -- index.scss
      -- variables/
        -- breakpoints.scss // this folder will contain the breakpoint varaibles for media.scss
        -- colors.scss // colors shade variables 
        -- fonts.scss
    -- components/
      -- index.jsx // this file should be only responsible for exports of components
      --component_name/
        -- index.jsx // every component should be an atomic file, i.e. ideally there should not be a possibility to extract more components out of it
        -- style.scss // this is a modular component level stylesheet, only responsible for the for the component alongside
    -- pages /
      -- index.jsx // same as above
      -- page1/ // this page will import the relevant components 
        -- index.jsx
        -- style.scss 
    -- global_store/
      -- index.js // these files should be named as ".js" instead of .jsx
                  // can be initially used to store all the atoms and selectors but will have to scale further
      -- sockets.js // this file will contain all the selectors and atoms related to sockets. Ideally states should not have a lot of subfolders. If required, we will divide it further
                    // all the atoms should end with the word "Atom" and the selectors should end with "Selector" for easier identification between a state object and a Recoil object
    -- controllers/api_layer // this folder will contain all the "js" files and the core logic that is not ui
      -- socket.js // all the socket related api calls should be done here
      -- localstorage.js // all the local storage related calls should be done here
      -- db.js ..... so on
    -- hooks // this folder will contain the custom hooks
      -- index.jsx // to export
      -- hookname.jsx // here

```

- We want to keep js and jsx naming conventions together in the codebase to allow differentiation between react components and javascript logic files.
- scss files should follow the BEM naming architecture everywhere
- media queries if used should be using the @include media library
- recoil atoms should end with the word "Atom" and follow camelCase
- all jsx/js should follow camelCase naming conventions
- recoil selectors should end with the word "Selector"
- global state modification should be ideally done in the global store and not in the UI logic


