"use strict";
define(
    ["i18n", "js/views/baseview"],
    function(i18n, BaseView) {
        var statusMap = {
            "Uploading": i18n.gettext("Uploading")
        };

        var PreviousVideoUploadView = BaseView.extend({
            tagName: "tr",

            initialize: function() {
                this.template = this.loadTemplate("previous-video-upload");
            },

            render: function() {
                var duration = this.model.get("duration");
                var renderedAttributes = {
                    // Translators: This is listed as the duration for a video that has not yet
                    // gotten far enough in the pipeline to have had its duration determined.
                    duration: duration > 0 ? duration : i18n.gettext("Pending"),
                    created: Date.parse(this.model.get("created")).toLocaleString(
                        {},
                        {timeZone: "UTC", timeZoneName: "short"}
                    ),
                    // Translators: This is the status label for a video upload with a status
                    // that is not known.
                    status: statusMap[this.model.get("status")] || i18n.gettext("Unknown")
                };
                this.$el.html(
                    this.template(_.extend({}, this.model.attributes, renderedAttributes))
                );
                return this;
            }
        });

        return PreviousVideoUploadView;
    }
);
