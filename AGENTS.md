# General coding guidelines

## Purpose of the project

- The project is a generalist (data-driven) slides player, supposedly able to presents online slides
- It plays slides within the browser, slide after slide
    - Each slide is a mix of : 
        - texts
        - images
- The user can navigate within the slides, using: 
    - Left & Right arrow keys to show previous and next slide
    - Up and Down arrow keys to show previous or next image within the current slide
- Each slide is described in the folder "static/slides/", using this pattern : slide_01.json, slide_02.json, slide_03.json ...
    - Each slide's json descriptor will list the following items : 
        - "human_name": "bg" -> slide background
        - "human_name": "photo0" -> first image of the slide, shown by default when entering the slide
        - "human_name": "photo1" -> next image, shown when the user press the "Down arrow" key, and so on
        - "human_name": "text0", "text1", and so on -> all the texts included in the slide, must be shown all at once
    - The texts items are actually PNG of rasterized texts
    - For each item, the key "bitmap" will link to the relative path to the PNG, starting in the "static" folder
- The entry point is a index.html
- all logic could be in Javascript file main.js
- Should run online or offline, using the simplest way available 

## Coding style

- All comments in English
- As much dependencies or external libraries as possible, unless there is no other option
- Might use ThreeJS, as I might need to display GLTF files at some point