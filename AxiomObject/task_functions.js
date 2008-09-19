function task_editable(){
	var task = this._task ? this._task.getTarget() : false;
	var editable = this.editable();
	if(editable && session.user.hasRole("Content Contributor") && task && task.assignee && task.assignee.getTarget().username != session.user.username){
		editable = false;
	}
	return editable;
}

function syncToLive(){
	app.deleteDraft(this, 1);
}

function publishToLive(){
	app.saveDraft(this);
}

function task_approved() {
	if (this._action == "Deleted") {
		this.cms_delete();
	} 
	this._action = null;
	this._task = null;

	this.publishToLive();
}
