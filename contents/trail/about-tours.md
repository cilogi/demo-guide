index: 204

## Tours

This is a simple sketch of a tour, or trail.  A tour is a means of arranging a sequence
of exhibits and locations in an informative order, possibly with linking material.

The sequence of exhibits on the tour is defined by the file `tour.txt` in the tour
directory. This contains the tour items.  For example:

     # Botanics Trail

     about-tours.html              |  Tours
     curators-house.html           |  The Curator's House
     sundial.html                  |  Sundial
     kibble-palace.html            |  Kibble Palace

The line starting with `#` is the tour title.  Each line after contains
the URL of an item (relative to the tour directory, followed by  a `|` character and the name
of the item, as it should appear in the tour overview page.

The overview page contains a list of the items in the tour, together with a title
and some explanatory text provided by the `index.md` file.

If any of the URLs in `tour.txt` are outside the tour directory, then the contents of that file
are (virtually) copied to the tour directory (with the same name) and links adjusted so that item can
be part of the tour as well as occurring elsewhere.  In this manner a single item can be part of
different tours in different contexts.

If you wish a tour to include audio or video this should be embedded in a normal page.

Any linking material should be included as a normal item, with text that makes it plain its not
an active part of the tour, and with a link to the map.
