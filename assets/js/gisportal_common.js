//gisportal common JS stuff

String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};

function showError(msg) {
    bootbox.alert({
        title: "Error",
        message: msg+"!",
        size: 'small'
    });
}

function onUploadFormSubmit() {

    var form = $('#uploadForm')[0];
    var client = $('#client_id')[0].value;
    var group = $('#project_group_id')[0].value;

    if(client === '') {
        showError(GP.clientRequired);
        return false;
    }

    var editingProject = $('#project_name')[0].value;

	if ($('#userfile')[0].files.length === 0) {
		showError(GP.noFile);
		return false;
	}

	var file = $('#userfile')[0].files[0].name;
	var size = $('#userfile')[0].files[0].size;
	var newProject = file.split('.')[0];
	var ext = file.split('.')[1];
	var allow = ['qgs', 'zip'];

	var upload_size = form['upload_size'].value
	var upload_size_text = form['upload_size_text'].value;

	form.action = GP.settings.siteUrl + '/projects/upload_admin/' + client + '/' + group;

	//client side validation
	if (allow.indexOf(ext.toLowerCase()) == -1) {
		showError(GP.onlyQgs);
		form.reset();
		return false;
	}
	if (editingProject && editingProject !== newProject) {
		showError(GP.differentProjects + " " + editingProject + ": " + newProject);
		form.reset();
		return false;
	}
	if (size > upload_size) {
		showError(GP.fileToBig + " " + upload_size_text);
		form.reset();
		return false;
	}
}

function confirmLink(msg,name,url) {
    bootbox.confirm(msg.replaceAll('{name}',name), function(doIt){
        if(doIt) {
            window.location = url;
        }
    });
}

function confirmDeleteProject(name,id) {
    bootbox.prompt({
        title: GP.delete + ' ' + GP.project + '?',
        message: GP.deleteProject.replaceAll('{name}',name),
        inputType: 'checkbox',
        inputOptions: [{text: GP.deleteProjectFiles, value: 1}],
        callback: function (del) {
           window.location = GP.settings.siteUrl + '/projects/remove/' + id + '/' + del;
        }
    });
}

function addRole(group, back) {
    //get user and role from ui
    var user = $('#user_search').typeahead("getActive");
    var role_id = $('#user_role').val();
    var client_id = $('#client_id').val();
    var text = $('#user_search').val();

    if(!user) {
        showError(GP.userRequired);
        return false;
    }

    if(user.name === text) {
        window.location = GP.settings.siteUrl + "/users/add_role/" + group + "/" + user.id + "/" + role_id + "/" + back + '/' + client_id;
    }
}

function addLayer(group,destination,back) {
    var layer = $('#layer_search').typeahead("getActive");
    var client_id = $('#client_id').val();
    var text = $('#layer_search').val();

    if(!layer) {
        showError(GP.layerRequired);
        return false;
    }

    if(layer.name === text) {
        window.location = GP.settings.siteUrl + "/project_groups/add_layer/" + group + "/" + layer.id + "/" + destination + '/' + client_id + '/' + back;
    }
}

function addLayerExtra(group,destination,back) {
    var layer = $('#extra_layer_search').typeahead("getActive");
    var client_id = $('#client_id').val();
    var text = $('#extra_layer_search').val();

    if(!layer) {
        showError(GP.layerRequired);
        return false;
    }

    if(layer.name === text) {
        window.location = GP.settings.siteUrl + "/project_groups/add_layer/" + group + "/" + layer.id + "/" + destination + '/' + client_id + '/' + back;
    }
}


function addRoleMulti(user) {

    var groups = $('#project_group_id').val();
    var role_id = $('#user_role').val();
    var client_id = $('#client_id').val();

    if(!groups || groups.length === 0) {
        showError('Select groups');
        return false
    }

    var arr = encodeURIComponent(groups.map(Number));

    window.location = GP.settings.siteUrl + "/users/add_role_multi/"+arr+"/"+user+"/"+role_id+'/'+client_id;
}

function addLayerMulti(layer) {

    var groups = $('#project_group_id').val();
    var destination = $('#destination').val();
    var client_id = $('#client_id').val();

    if(!groups || groups.length == 0) {
        showError('Select groups');
        return false
    }

    var arr = encodeURIComponent(groups.map(Number));

    window.location = GP.settings.siteUrl + "/project_groups/add_layer/"+arr+"/"+layer+"/"+destination+'/'+client_id+'/layers';
}

function removeAdmin(user, user_id, role, roleName) {

    var url = GP.settings.siteUrl + '/users/set_admin/' + user_id + '/1/'+role;
    var msg = GP.adminRemove.replaceAll('{role}',roleName);

    confirmLink(msg,user,url);
}

function chooseAdminScope(user, user_id, role, roleName) {

    //disable button
    //$('#adminBtn').css("pointer-events", "none");
    var adminAddMsg = GP.adminAddMsg.replaceAll('{role}',roleName);
    var adminAdd = GP.adminAdd.replaceAll('{name}',user).replaceAll('{role}',roleName);

    var groups = [];
    groups.push({"value": -1, "text": adminAddMsg});
    if(role === 'admin') {
        groups.push({"value": 0, "text": GP.adminFullName});
    }
    var url = GP.settings.siteUrl + '/clients/get_list/';

    $.getJSON(url, function (data) {
        $.each(data, function (key, entry) {
            groups.push({"value": entry.id, "text": entry.name});
        });

        bootbox.prompt({
            title: adminAdd,
            message: '',
            inputType: 'radio',
            inputOptions: groups,
            callback: function (client) {
                if(client === '-1') {
                    showError(adminAddMsg);
                    return false;
                }
                if(client) {
                    window.location = GP.settings.siteUrl + '/users/set_admin/' + user_id + '/0/'+role+'/'+client;
                }
            }
        });

        //enable button back
        //$('#adminBtn').css("pointer-events", "auto");
    });
}


function addGroup(back) {

    var client_id = $('#client_id').val();

    bootbox.prompt({
        title: GP.addGroupTitle,
        message: GP.addGroupMsg,
        callback: function (name) {
            if(name) {
                window.location = GP.settings.siteUrl + "/project_groups/add_group/"+client_id+"/"+encodeURIComponent(name)+"?back="+back;
            }
        }
    });
}

function chooseGroup(client, target) {

    //disable button
    $('#copyBtn').css("pointer-events", "none");

    var groups = [];

    var url = GP.settings.siteUrl + '/project_groups/get_list/' + client + '/true';


    $.getJSON(url, function (data) {
        $.each(data, function (key, entry) {
            if(entry.id === target) {
                return;
            }
            groups.push({"value": entry.id, "text": entry.name});
        });

        if(groups.length === 0) {
            showError("No available groups!");
            return false;
        }

        bootbox.prompt({
            title: GP.copyTitle,
            message: GP.copyMsg,
            inputType: 'radio',
            inputOptions: groups,
            callback: function (source) {
                //result = group_id or null
                if(source) {
                    window.location = GP.settings.siteUrl + "/users/copy_roles/"+source+"/"+target;
                }
            }
        });

        //enable button back
        $('#copyBtn').css("pointer-events", "auto");
    });
}

function switchRole(group, user, role, back) {
    //assuming we only have roles 20 and 21 to switch between.
    var newRole = 0;

    if (role === 20) {
        newRole = 21;
    } else if (role === 21) {
        newRole = 20;
    }

    if(newRole>0) {
        window.location = GP.settings.siteUrl + "/users/set_role/"+group+"/"+user+"/"+newRole+"/"+back;
    }
}

function onProjectGroupEditClick(item) {
    var group = $('#'+item).val();
    if(group) {
        var url = GP.settings.siteUrl + '/project_groups/edit/' + group;
        window.location = url;
    }
}

function onProjectEditGroupChange(id,sel) {
    var btn = $('#projectGroupEditBtn');
    var val = parseInt(sel.value);
    if(id === val) {
        btn.removeClass('disabled');
    } else {
        btn.addClass('disabled');
    }
}

function getParentGroups(sel, group)
{
    var val = sel.value;
    var list = $('#parent_id');

    var url = GP.settings.siteUrl+'/project_groups/get_parents/'+val+'/'+group;

    if (val > 0) {

        //get new parent groups
        list.empty();
        list.append('<option></option>');
        list.prop('selectedIndex', 0);

        $.getJSON(url, function (data) {
            $.each(data, function (key, entry) {
                list.append($('<option></option>').attr('value', entry.id).text(entry.name));
            })
        });
    }
}

function onProjectCreateGroupChange(sel)
{
    var val = sel.value;
    var div = $('#uploadDiv');

    if (val > 0) {
        div.show();
    } else {
        div.hide();
    }
}

function onClientChange(sel,action)
{
    var val = sel.value;
    var div = $('#templateDiv');
    var template = $('#template');
    var group = $('#project_group_id');
    var groupDiv = $('#groupDiv');
    var url = GP.settings.siteUrl+'/project_groups/get_list/'+val;
    var url2 = GP.settings.siteUrl+'/projects/get_templates/'+val;

    // if(action === 2) {
    //     div = $('#uploadDiv');
    // }

    if (val > 0) {

        //get new client groups
        group.empty();
        if(action !== 3) {
            group.append('<option disabled>' + GP.selectGroup + '</option>');
        }
        group.prop('selectedIndex', 0);

        $.getJSON(url, function (data) {
            $.each(data, function (key, entry) {
                group.append($('<option></option>').attr('value', entry.id).text(entry.name));
            })
        });

        //get new templates
        template.empty();
        template.append('<option disabled>' + GP.selectTemplate + '</option>');
        template.prop('selectedIndex', 0);

        $.getJSON(url2, function (data) {
            $.each(data, function (key, entry) {
                template.append($('<option></option>').attr('value', entry).text(entry));
            })
        });

        div.show();
        groupDiv.show();

    } else {
        div.hide();
        groupDiv.hide();
    }
}

function openSubGroups(index, row) {
    return parseInt(row.gp_type) === 1;

}

function makeGroupAction(value, row) {

    var type = row.type;
    var text;

    //project
    if(type === 0) {
        text = GP.group;
    } else if (type === 1) {
        text = GP.menuGroup;
    }

    return '<a class="btn btn-default" href="'+GP.settings.siteUrl+'/project_groups/edit/'+value+'">'+text+'</a>';
}

function userRowStyle(row, index) {
    if(row.gp_active == '') {
        return {classes: 'alert-warning'};
    } else {
        return {classes: 'alert-default'};
    }
}
