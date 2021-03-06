(function($, _, Backbone, gettext, interpolate_text, CohortEditorView, NotificationModel, NotificationView, FileUploaderView) {
    var hiddenClass = 'is-hidden',
        disabledClass = 'is-disabled';

    this.CohortsView = Backbone.View.extend({
        events : {
            'change .cohort-select': 'onCohortSelected',
            'click .action-create': 'showAddCohortForm',
            'click .action-cancel': 'cancelAddCohortForm',
            'click .action-save': 'saveAddCohortForm',
            'click .link-cross-reference': 'showSection',
            'click .toggle-cohort-management-secondary': 'showCsvUpload'
        },

        initialize: function(options) {
            var model = this.model;

            this.template = _.template($('#cohorts-tpl').text());
            this.selectorTemplate = _.template($('#cohort-selector-tpl').text());
            this.addCohortFormTemplate = _.template($('#add-cohort-form-tpl').text());
            this.advanced_settings_url = options.advanced_settings_url;
            this.upload_cohorts_csv_url = options.upload_cohorts_csv_url;
            model.on('sync', this.onSync, this);

            // Update cohort counts when the user clicks back on the membership tab
            // (for example, after uploading a csv file of cohort assignments and then
            // checking results on data download tab).
            $(this.getSectionCss('membership')).click(function () {
                model.fetch();
            });
        },

        render: function() {
            this.$el.html(this.template({
                cohorts: this.model.models
            }));
            this.onSync();
            return this;
        },

        renderSelector: function(selectedCohort) {
            this.$('.cohort-select').html(this.selectorTemplate({
                cohorts: this.model.models,
                selectedCohort: selectedCohort
            }));
        },

        onSync: function() {
            var selectedCohort = this.lastSelectedCohortId && this.model.get(this.lastSelectedCohortId),
                hasCohorts = this.model.length > 0,
                cohortNavElement = this.$('.cohort-management-nav'),
                additionalCohortControlElement = this.$('.wrapper-cohort-supplemental');
            this.hideAddCohortForm();
            if (hasCohorts) {
                cohortNavElement.removeClass(hiddenClass);
                additionalCohortControlElement.removeClass(hiddenClass);
                this.renderSelector(selectedCohort);
                if (selectedCohort) {
                    this.showCohortEditor(selectedCohort);
                }
            } else {
                cohortNavElement.addClass(hiddenClass);
                additionalCohortControlElement.addClass(hiddenClass);
                this.showNotification({
                    type: 'warning',
                    title: gettext('You currently have no cohort groups configured'),
                    actionText: gettext('Add Cohort Group'),
                    actionClass: 'action-create',
                    actionIconClass: 'icon-plus'
                });
            }
        },

        getSelectedCohort: function() {
            var id = this.$('.cohort-select').val();
            return id && this.model.get(parseInt(id));
        },

        onCohortSelected: function(event) {
            event.preventDefault();
            var selectedCohort = this.getSelectedCohort();
            this.lastSelectedCohortId = selectedCohort.get('id');
            this.showCohortEditor(selectedCohort);
        },

        showCohortEditor: function(cohort) {
            this.removeNotification();
            if (this.editor) {
                this.editor.setCohort(cohort);
            } else {
                this.editor = new CohortEditorView({
                    el: this.$('.cohort-management-group'),
                    model: cohort,
                    cohorts: this.model,
                    advanced_settings_url: this.advanced_settings_url
                });
                this.editor.render();
            }
        },

        showNotification: function(options, beforeElement) {
            var model = new NotificationModel(options);
            this.removeNotification();
            this.notification = new NotificationView({
                model: model
            });
            this.notification.render();
            if (!beforeElement) {
                beforeElement = this.$('.cohort-management-group');
            }
            beforeElement.before(this.notification.$el);
        },

        removeNotification: function() {
            if (this.notification) {
                this.notification.remove();
            }
        },

        showAddCohortForm: function(event) {
            event.preventDefault();
            this.removeNotification();
            this.addCohortForm = $(this.addCohortFormTemplate({}));
            this.addCohortForm.insertAfter(this.$('.cohort-management-nav'));
            this.setCohortEditorVisibility(false);
        },

        hideAddCohortForm: function() {
            this.setCohortEditorVisibility(true);
            if (this.addCohortForm) {
                this.addCohortForm.remove();
                this.addCohortForm = null;
            }
        },

        setCohortEditorVisibility: function(showEditor) {
            if (showEditor) {
                this.$('.cohort-management-group').removeClass(hiddenClass);
                this.$('.cohort-management-nav').removeClass(disabledClass).attr('aria-disabled', false);
            } else {
                this.$('.cohort-management-group').addClass(hiddenClass);
                this.$('.cohort-management-nav').addClass(disabledClass).attr('aria-disabled', true);
            }
        },

        saveAddCohortForm: function(event) {
            event.preventDefault();
            var self = this,
                showAddError,
                cohortName = this.$('.cohort-create-name').val().trim();
            showAddError = function(message) {
                self.showNotification(
                    {type: 'error', title: message},
                    self.$('.cohort-management-create-form-name label')
                );
            };
            this.removeNotification();
            if (cohortName.length > 0) {
                $.post(
                        this.model.url + '/add',
                    {name: cohortName}
                ).done(function(result) {
                        if (result.success) {
                            self.lastSelectedCohortId = result.cohort.id;
                            self.model.fetch().done(function() {
                                self.showNotification({
                                    type: 'confirmation',
                                    title: interpolate_text(
                                        gettext('The {cohortGroupName} cohort group has been created. You can manually add students to this group below.'),
                                        {cohortGroupName: cohortName}
                                    )
                                });
                            });
                        } else {
                            showAddError(result.msg);
                        }
                    }).fail(function() {
                        showAddError(gettext("We've encountered an error. Please refresh your browser and then try again."));
                    });
            } else {
                showAddError(gettext('Please enter a name for your new cohort group.'));
            }
        },

        cancelAddCohortForm: function(event) {
            event.preventDefault();
            this.removeNotification();
            this.onSync();
        },

        showSection: function(event) {
            event.preventDefault();
            var section = $(event.currentTarget).data("section");
            $(this.getSectionCss(section)).click();
            $(window).scrollTop(0);
        },

        showCsvUpload: function(event) {
            event.preventDefault();

            $(event.currentTarget).addClass(hiddenClass);
            var uploadElement = this.$('.csv-upload').removeClass(hiddenClass);

            if (!this.fileUploaderView) {
                this.fileUploaderView = new FileUploaderView({
                    el: uploadElement,
                    title: gettext("Assign students to cohort groups by uploading a CSV file."),
                    inputLabel: gettext("Choose a .csv file"),
                    inputTip: gettext("Only properly formatted .csv files will be accepted."),
                    submitButtonText: gettext("Upload File and Assign Students"),
                    extensions: ".csv",
                    url: this.upload_cohorts_csv_url,
                    successNotification: function (file, event, data) {
                        var message = interpolate_text(gettext(
                            "Your file '{file}' has been uploaded. Please allow a few minutes for processing."
                        ), {file: file});
                        return new NotificationModel({
                            type: "confirmation",
                            title: message
                        });
                    }
                }).render();
            }
        },

        getSectionCss: function (section) {
            return ".instructor-nav .nav-item a[data-section='" + section + "']";
        }

    });
}).call(this, $, _, Backbone, gettext, interpolate_text, CohortEditorView, NotificationModel, NotificationView, FileUploaderView);
