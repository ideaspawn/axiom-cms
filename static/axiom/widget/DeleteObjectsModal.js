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


/**
Copyright Axiom
Thomas Mayfield
*/

dojo.provide("axiom.widget.DeleteObjectsModal");

dojo.require("dojo.lang.common");
dojo.require("dojo.html.*");
dojo.require("dojo.event.*");
dojo.require("dojo.widget.*");
dojo.require("axiom.widget.AxiomModal");

dojo.widget.defineWidget(
	"axiom.widget.DeleteObjectsModal",
	axiom.widget.AxiomModal,
	function(){},
	{
		taskField: null,
		errorField: null,
		objects: [],
		templatePath:new dojo.uri.dojoUri('../axiom/widget/resources/AxiomModal.html'),
		templateCssPath:new dojo.uri.dojoUri('../axiom/widget/resources/DeleteObjectsModal.css'),
		close:function(){
			axiom.closeModal();
		},
		onEnter: function(){
			this.addToTask();
		},
		addToTask:function(){
			if(this.taskField.value){
				var task_id = this.taskField.value;
				var message;
				if(this.objects.length < 2 ){
					if (task_id == 'BYPASS') {
						message = this.objects[0].title + ' has been deleted.';
					} else {
						message = this.objects[0].title + ' has been added to task ' + task_id + ' for deletion.';
					}
				} else {
					if (task_id == 'BYPASS') {
						message = this.objects.length + ' content objects have been deleted.';
					} else {
						message = this.objects.length + ' content objects have been added to task '+ task_id + ' for deletion.';
					}
				}
				this.doTaskAction({url: axiom.cmsPath + 'add_to_delete_task',
								   params:   {objects: this.objects, task_id: task_id},
								   message:  message,
								   callback: function(){axiom.cfilter.search();}
								  });

			} else{
				this.errorField.style.display = 'block';
				this.errorField.innerHTML = "Please select a task before proceeding.";
			}
		},
		deleteObjects: function(){
			var widget = this;
			var message;
			if(this.objects.length < 2 ){
				message = this.objects[0].title + ' has been deleted.';
			} else {
				message = this.objects.length + ' content objects have been deleted.';
			}

			dojo.io.bind({ url: axiom.cmsPath + 'delete_objects',
						   method: 'post',
						   contentType: 'text/json',
						   postContent: dojo.json.serialize({objs: this.objects}),
						   load: function() {
							   widget.close();
							   axiom.showMessage(message);
							   axiom.cfilter.search();
						   },
						   error: function() { axiom.openModal({content: "Error deleting objects."}); }
						 });
		},
		postCreate:function() {
			this.title.innerHTML = "Add Content to Task for Deletion";

		    var table = document.createElement("table");
		    table.setAttribute("id", "Delete");
		    var thead = document.createElement("thead");
		    var thead_tr = document.createElement("tr");
		    var th_title = document.createElement("th");
		    th_title.setAttribute("width", "60%");
		    th_title.setAttribute("class", "title");
		    th_title.appendChild(document.createTextNode("Title"));
		    var th_affected = document.createElement("th");
		    th_affected.setAttribute("class", "affected");
		    th_affected.appendChild(document.createTextNode("Attached Objects (count)*"));
		    thead_tr.appendChild(th_title);
		    thead_tr.appendChild(th_affected);
		    thead.appendChild(thead_tr);
		    table.appendChild(thead);
		    var tbody = document.createElement("tbody");

			var textList = [];
			for(var i in this.objects){
			    var o = this.objects[i];
			    var tr = document.createElement("tr");
			    var td_title = document.createElement("td");
			    td_title.setAttribute("class", "title");
			    td_title.innerHTML = o.title;
			    var td_affected = document.createElement("td");
			    td_affected.setAttribute("class", "affected");
			    td_affected.innerHTML = o.num_children;
			    tr.appendChild(td_title);
			    tr.appendChild(td_affected);
			    tbody.appendChild(tr);
			}
		    table.appendChild(tbody);
		    this.mainContent.appendChild(table);
		    var note = document.createElement("p");
		    note.appendChild(document.createTextNode("* Attached objects will be automatically detached, but will not be removed from the CMS"));
		    note.setAttribute("class", "note");
		    this.mainContent.appendChild(note);

			var error_field = document.createElement('div');
			error_field.className = 'error_message';
			this.errorField = error_field;
			this.mainContent.appendChild(error_field);

			var task_label = document.createElement('label');
			task_label.innerHTML = '<span class="required">*</span>Task: ';
			this.mainContent.appendChild(task_label);

			var task_list = document.createElement('select');
			var opt = document.createElement('option');
			opt.innerHTML = '--Choose One--';
			opt.value = '';
			task_list.appendChild(opt);
			for(var i in axiom.myAssignedTasks){
				var task = axiom.myAssignedTasks[i];
				opt = document.createElement('option');
				opt.innerHTML = task.task_id + ' - ' +task.name;
				opt.value = task.task_id;
				task_list.appendChild(opt);
			}
			if (axiom.isAdministrator) {
				var bypassopt = document.createElement('option');
				bypassopt.innerHTML = 'BYPASS TASK CREATION';
				bypassopt.value = 'BYPASS';
				task_list.appendChild(bypassopt);
			}
			this.taskField = task_list;
			this.mainContent.appendChild(task_list);

			this.modalButtons.innerHTML = '';
			var saveButton = document.createElement('a');
			saveButton.className = 'button form-button';
			saveButton.innerHTML = "Save";

			dojo.event.kwConnect({srcObj: saveButton,
								  srcFunc: 'onclick',
								  adviceObj: this,
								  adviceFunc: 'addToTask'
								 });
			this.modalButtons.appendChild(saveButton);

			var cancelButton = document.createElement('a');
			cancelButton.className = 'button form-button';
			cancelButton.innerHTML = "Cancel";
			dojo.event.kwConnect({srcObj: cancelButton,
								  srcFunc: 'onclick',
								  adviceObj: this,
								  adviceFunc: 'close'});
			this.modalButtons.appendChild(cancelButton);

			this.modalIcon.src = axiom.staticPath + '/axiom/images/icon_delete.gif';
		}
	}
);
