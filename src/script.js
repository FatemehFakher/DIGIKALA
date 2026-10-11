const carousel = document.getElementById("carousel");
const track = document.getElementById("track");
const slides = track.children;

const gap = 8; // gap-2 = 8px

const slideDuration = 500;
const autoSlideDelay = 4000;

// Clone 12 = index 0
// Real slide 1 = index 1
// Real slide 12 = index slides.length - 2
// Clone 1 = index slides.length - 1

const firstRealSlide = 1;
const lastRealSlide = slides.length - 2;
const firstClone = 0;
const lastClone = slides.length - 1;

let currentSlide = firstRealSlide;

let startX = 0;
let startOffset = 0;
let isDragging = false;

let autoSlideTimer = null;
let cloneResetTimer = null;


// *=================================*
// *Get the position of a slide*
// *=================================*

function getSlideOffset(index) {
    const slide = slides[index];

    const slideWidth = slide.offsetWidth;

    return (
        slide.offsetLeft -
        (carousel.clientWidth - slideWidth) / 2
    );
}


// *=================================*
// *Move to a specific slide*
// *=================================*

function goToSlide(index, animate = true) {
    const offset = getSlideOffset(index);

    if (animate) {
        track.style.transition =
            "transform " + slideDuration + "ms ease-in-out";
    } else {
        track.style.transition = "none";
    }

    track.style.transform =
        "translateX(-" + offset + "px)";
}


// *=================================*
// *Reset from a clone to a real slide*
// *=================================*

function resetFromClone() {

    clearTimeout(cloneResetTimer);

    // Clone 1 → real slide 1

    if (currentSlide === lastClone) {

        currentSlide = firstRealSlide;

        goToSlide(currentSlide, false);
    }


    // Clone 12 → real slide 12

    else if (currentSlide === firstClone) {

        currentSlide = lastRealSlide;

        goToSlide(currentSlide, false);
    }
}


// *=================================*
// *Schedule clone reset*
// *=================================*

function scheduleCloneReset() {

    clearTimeout(cloneResetTimer);

    cloneResetTimer = setTimeout(() => {

        resetFromClone();

        startAutoSlide();

    }, slideDuration + 50);
}


// *=================================*
// *Automatic slideshow*
// *=================================*

function startAutoSlide() {

    clearTimeout(autoSlideTimer);

    autoSlideTimer = setTimeout(() => {

        currentSlide++;

        goToSlide(currentSlide, true);

    }, autoSlideDelay);
}


// *=================================*
// *Start on real slide 1*
// *=================================*

goToSlide(currentSlide, false);

startAutoSlide();


// *=================================*
// *Transition finished*
// *=================================*

track.addEventListener("transitionend", () => {

    // If we reached a clone,
    // immediately move to the matching real slide.

    if (
        currentSlide === firstClone ||
        currentSlide === lastClone
    ) {

        clearTimeout(cloneResetTimer);

        resetFromClone();

    }

    // Start the automatic timer again.

    startAutoSlide();
});


// *=================================*
// *Touch start*
// *=================================*

carousel.addEventListener("touchstart", (event) => {

    isDragging = true;

    startX = event.touches[0].clientX;

    // Stop automatic slideshow

    clearTimeout(autoSlideTimer);

    clearTimeout(cloneResetTimer);

    // Disable animation while dragging

    track.style.transition = "none";

    // Save current position

    startOffset = getSlideOffset(currentSlide);
});


// *=================================*
// *Touch move*
// *=================================*

carousel.addEventListener("touchmove", (event) => {

    if (!isDragging) {
        return;
    }

    const currentX = event.touches[0].clientX;

    const difference = startX - currentX;

    const newOffset = startOffset + difference;

    track.style.transform =
        "translateX(-" + newOffset + "px)";
});


// *=================================*
// *Touch end*
// *=================================*

carousel.addEventListener("touchend", (event) => {

    if (!isDragging) {
        return;
    }

    isDragging = false;

    const endX = event.changedTouches[0].clientX;

    const difference = startX - endX;

    const slideWidth =
        slides[currentSlide].offsetWidth + gap;


    // Calculate how many slides the user dragged

    const slidesMoved = Math.max(
        1,
        Math.round(Math.abs(difference) / slideWidth)
    );


    // *=================================*
    // *Swipe left → next*
    // *=================================*

    if (difference > 30) {

        currentSlide += slidesMoved;
    }


    // *=================================*
    // *Swipe right → previous*
    // *=================================*

    else if (difference < -30) {

        currentSlide -= slidesMoved;
    }


    // *=================================*
    // *Tiny movement*
    // *=================================*

    else {

        goToSlide(currentSlide, true);

        startAutoSlide();

        return;
    }


    // *=================================*
    // *Keep within clone boundaries*
    // *=================================*

    if (currentSlide < firstClone) {
        currentSlide = firstClone;
    }

    if (currentSlide > lastClone) {
        currentSlide = lastClone;
    }


    // *=================================*
    // *Move to selected slide*
    // *=================================*

    goToSlide(currentSlide, true);


    // *=================================*
    // *Important clone fallback*
    // *=================================*

    // If the user swipes directly onto a clone,
    // transitionend might not fire because the
    // track may already be at that exact position.

    if (
        currentSlide === firstClone ||
        currentSlide === lastClone
    ) {

        scheduleCloneReset();
    }


    // Restart the automatic timer

    startAutoSlide();
});


// *=================================*
// *Touch cancelled*
// *=================================*

carousel.addEventListener("touchcancel", () => {

    if (!isDragging) {
        return;
    }

    isDragging = false;

    goToSlide(currentSlide, true);

    startAutoSlide();
});