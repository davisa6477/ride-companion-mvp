# Home Page Frame

The passenger Home page now uses the standard passenger page frame:

```txt
PAGE_FRAME_CLASS
```

The main landing layout fits inside the usable tablet/kiosk height. The left driver welcome card and right utility column both stay within the frame.

## Layout behavior

```txt
Driver welcome card:
- fixed to available frame height
- driver/profile text area can scroll internally if needed
- quick action buttons remain anchored at the bottom

Right utility column:
- fixed to available frame height
- Tips/Reviews and Featured Deal cards scroll internally if needed
```

This keeps the passenger landing screen aligned with the Mirror baseline and avoids full-page scrolling.
