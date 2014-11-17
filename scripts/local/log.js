// Copyright (c) 2011 Tim Niblett All Rights Reserved.
//
// File:        log.js.java  (08-Aug-2011)
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



var cilogi = cilogi || {};

cilogi.local = cilogi.local || {};

cilogi.diagramId = null;

(function() {
    cilogi.log = function() {
        if((typeof console !== 'undefined')) {
            console.log(Array.prototype.slice.call(arguments, 0));
        }
    }
})();

