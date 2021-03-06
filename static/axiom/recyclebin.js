/**
 * Axiom Content Management System (CMS)
 * Copyright (C) 2009 Axiom Software Inc.
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License as
 * published by the Free Software Foundation; either version 2 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 59 Temple Place, Suite 330, Boston, MA 02111-1307
 * USA or contact Axiom Software Inc., 11480 Commerce Park Drive,
 * Third Floor, Reston, VA 20191 USA or email:
 * info@axiomsoftwareinc.com
 * */


var recyclebin = {
	init: function(){
		dojo.require('dojo.json');
		dojo.require('axiom.widget.RecycleBinTable');
		dojo.require('axiom.widget.RecycleBinFilter');
		recyclebin.ctable = dojo.widget.createWidget("axiom:RecycleBinTable",
							{appPath:axiom.appPath,
							searchURL: 'recycle_bin_contents'},
							dojo.byId("RecycleBinTable"));

		recyclebin.cfilter = dojo.widget.createWidget("axiom:RecycleBinFilter",
												 { prototypes:["CMSTrashBag"],
												   appPath:axiom.appPath},
												 dojo.byId("RecycleBinFilter"));
		recyclebin.cfilter.registerTable(recyclebin.ctable);
		recyclebin.cfilter.search();
	}
};
dojo.addOnLoad(recyclebin.init);
