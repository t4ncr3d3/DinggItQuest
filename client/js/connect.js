/**
 * Copyright (C) Work Bandits
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
 */



define(['lib/dinggit'], function() {

    DI.init({
        apiKey: '6f262109d5a3451d8513dcf2cd54e452', 
        status: true,
        cookie: true,
        logging: true
    });

    /* All the events registered */
    DI.Event.subscribe('auth.login', function(response) {
        console.log("auth login"); 
    });

    DI.Event.subscribe('auth.statusChange', function(response) {
        console.log("status change");
    });

    DI.Event.subscribe('auth.sessionChange', function(response) {
       console.log("session change"); 
    });

});

