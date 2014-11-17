// Copyright (c) 2011 Tim Niblett All Rights Reserved.
//
// File:        modernizr-functions.js.java  (08-Aug-2011)
// Author:      tim
// $
//
// Copyright in the whole and every part of this source file belongs to
// Tim Niblett (the Author) and may not be used, sold, licenced, transferred, 
// copied or reproduced in whole or in part in any manner or form or in 
// or on any media to any person other than in accordance with the terms of 
// The Author's agreement or otherwise without the prior written consent of
// The Author.
//
Modernizr.addTest('standalone', function () {
    var isIframe = window!=window.top;
    return isIframe || (('standalone' in navigator
                      && navigator.standalone
                      && (/iphone|ipod|ipad/gi).test(navigator.platform)));
});