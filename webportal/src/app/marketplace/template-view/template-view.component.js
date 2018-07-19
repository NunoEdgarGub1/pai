// Copyright (c) Microsoft Corporation
// All rights reserved.
//
// MIT License
//
// Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated
// documentation files (the "Software"), to deal in the Software without restriction, including without limitation
// the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and
// to permit persons to whom the Software is furnished to do so, subject to the following conditions:
// The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED *AS IS*, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING
// BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
// NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.


require('bootstrap/js/modal.js');
require('datatables.net/js/jquery.dataTables.js');
require('datatables.net-bs/js/dataTables.bootstrap.js');
require('datatables.net-bs/css/dataTables.bootstrap.css');
require('datatables.net-plugins/sorting/natural.js');
require('./template-view.component.scss');

const breadcrumbComponent = require('../../job/breadcrumb/breadcrumb.component.ejs');
const loadingComponent = require('../../job/loading/loading.component.ejs');
const templateViewComponent = require('./template-view.component.ejs');
const templateTableComponent = require('./template-table.component.ejs');
const templateModalComponent = require('./template-modal.component');
const loading = require('../../job/loading/loading.component');
const webportalConfig = require('../../config/webportal.config.json');

let tables = {'#job-table': null,
              '#data-table': null,
              '#script-table': null,
              '#dockerimage-table': null,
            };

$('#content-wrapper').html(templateViewComponent({
  breadcrumb: breadcrumbComponent,
  loading: loadingComponent,
  template: templateTableComponent,
}));

const generateQueryString = function(data) {
  return '?type=' + encodeURIComponent(data.type) + '&name=' + encodeURIComponent(data.name) + '&version='
    + encodeURIComponent(data.version);
};

const loadTemplates = function(name) {
  const tablename = '#' + name + '-table';
  const $table = $(tablename)
    .on('preXhr.dt', loading.showLoading)
    .on('xhr.dt', loading.hideLoading);

  tables[tablename] = $table.dataTable({
    'ajax': {
      url: `${webportalConfig.restServerUri}/api/v1/template/${name}`,
      type: 'GET',
      dataSrc: (data) => {
        if (data.code) {
          alert(data.message);
        } else {
          return data;
        }
      },
    },
    'columns': [
      {
        title: 'Template',
        data: 'name',
      },
      {
        title: 'Used',
        data: 'count',
      },
      {
        title: 'Description',
        data: 'description',
        orderable: false,
      },
      {
        title: 'Operation',
        data: generateQueryString,
        orderable: false,
        searchable: false,
        render: function(qs, type) {
          return '<button class="btn btn-default btn-sm" onclick="window.location.href=\'/import.html'
            + qs + '\'">Use</button>';
        },
      },
    ],
    'order': [
      [1, 'desc'],
    ],
    //'scrollY': (($(window).height() - 265)) + 'px',
    'lengthMenu': [[20, 50, 100, -1], [20, 50, 100, 'All']],
    'deferRender': true,
    'autoWidth': false,
  }).api();
};

$(window).resize(function(event) {
  $('#content-wrapper').css({'height': (($(window).height() - 200)) + 'px'});
  Object.keys(tables).forEach((name) => {
    if (tables[name] != null) {
      tables[name].columns.adjust().draw();
    }
  });
});

$('#btn-share').click(function(event) {
  $('#modalPlaceHolder').html(templateModalComponent.generateHtml());
  templateModalComponent.initializeComponent();
  $('#shareModal').modal('show');
});

$(document).ready(() => {
  $('#sidebar-menu--template-view').addClass('active');
  $('#content-wrapper').css({'overflow': 'hidden'});
  $('#table-view').html(templateTableComponent());
  loadTemplates('job');
  loadTemplates('data');
  loadTemplates('script');
  loadTemplates('dockerimage');
  window.dispatchEvent(new Event('resize'));
});