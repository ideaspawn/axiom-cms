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


function get_object_ids(){
	return app.getSources(this).pluck('_id');
}

/**
 *   Wrapper around normal save function.  Looks up path of
 *   assignee obj.
 */
function save_task(data){
	data = (data || req.data);
	if(!data.due_date){
		delete data.due_date;
	}
	var user = app.getHits("CMSUser", {username: data.assignee}).objects(0,1)[0];
	if(!user){
		app.log("CMSTask.save_task: Couldn't find user: "+data.assignee);
		return {errors: {assignee: "No such user found: "+data.assignee}};
	} else{
		data.assignee = user.getPath();
	}

	var current = this.assignee.getTarget().username;
	var mailer = null;
	if(user.username != current && user.username != session.user.username){
		mailer = new axiom.Mail();
		mailer.setData({to:      {email:   user.email,
							      name:    user.first_name+' '+user.last_name},
						from:    {email: session.user.email,
							      name:  session.user.first_name+' '+session.user.last_name},
						subject: 'Axiom CMS: Task '+this.task_id+' has been assigned to you.',
						html:     root.get('cms').task_email({assignee_name:  user.first_name,
															  actor_name:     session.user.first_name,
															  action:         session.user.first_name+' has assigned you the following tasks:',
															  tasks:          [this],
															  body:           'All content objects within the task(s) above are now owned by you.',
															  show_link:	  true
															 })
					   });
	}

	var result = this.edit(data);
	if(mailer) mailer.send();
	return result;
}

function archive(conn){
	app.log('Archiving Task '+this.task_id);

	var due_date = this.due_date;
	var date = Date.prototype.pad(due_date.getDate());
	var month = Date.prototype.pad(due_date.getMonth()+1);
	var sql = "INSERT INTO AuditLog_ArchivedTasks (task_id, name, description, due_date, approved_by, submitter, creator) VALUES( "+
 		this.task_id+",'"+
		this.name+"','"+
		this.description+"', DATE '"+
		due_date.getFullYear()+'-'+date+'-'+month+"','"+
		this.admin_actor+"','"+
		this.submitter_searchable+"','"+
		this.creator+"')";
	var stmt = conn.prepareStatement(sql);
	stmt.execute();
	stmt.close();

	this._parent.remove(this);
}

/**
 *  Return a boolean indicating if the object can be deleted in the cms
 */
function deletable(){
	return this.status.match(/Incomplete|Rejected/);
}

function submittable(){
	return this.status.match(/Incomplete|Rejected/);
}

function approvable(){
	return this.status == "Pending";
}

function rejectable(){
		return this.status == "Pending";
}
