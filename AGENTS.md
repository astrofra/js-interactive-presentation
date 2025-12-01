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
        - "human_name": "bg" -> slide background (no round corners on this one)
        - "human_name": "photo0" -> first image of the slide, shown by default when entering the slide
        - "human_name": "photo1" -> next image, shown when the user press the "Down arrow" key, and so on
        - "human_name": "text0", "text1", and so on -> all the texts included in the slide, must be shown all at once
        - either text and photo should have their aspect ratio similar to what is found in the json file
    - The texts items are actually PNG of rasterized texts
    - For each item, the key "bitmap" will link to the relative path to the PNG, starting in the "static" folder
- The entry point is a index.html
- all logic could be in Javascript file main.js
- Should run online or offline, using the simplest way available
- Windows/screen size :
    - the size of "human_name": "bg" (slide's background) should be the reference of maxium display surface. The background should fit either in width or height, to the browser document rect, always adjusted, never cropped or cut.
- Cosmetics :
    - all the "human_name": "text0", "text1", "text2", ... should appear in a "fade in" (controling the opacity only). Each next text "fade in" should start with 150ms delay after the previous one.
    - when going from one image ("photo0", "photo1", either forward or backward), each new photo should appear in a 150ms "fade in" (controling the opacity as well, from 0% to 100%).

## Coding style

- All comments in English
- As much dependencies or external libraries as possible, unless there is no other option
- Might use ThreeJS, as I might need to display GLTF files at some point