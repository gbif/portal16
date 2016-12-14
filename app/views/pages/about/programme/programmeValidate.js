'use strict';

// check if all the project has necessary columns so the table doesn't break.
function relatedProjectsValidate(relatedProjects) {
    var valid = true;
    relatedProjects.forEach(function (project) {
        if (['small', 'national', 'regional'].indexOf(project.grantType) == -1) {
            valid = false;
            project.grantType = 'undefined';
        }
    });
    return valid;
}

module.exports = relatedProjectsValidate;