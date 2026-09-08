package com.reeltrack.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "activity_logs")
public class ActivityLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String icon;
    private String tone;
    private String title;
    private String sub;
    private String time;
    private LocalDateTime timestamp = LocalDateTime.now();

    public ActivityLog() {}

    public ActivityLog(Long id, String icon, String tone, String title, String sub, String time, LocalDateTime timestamp) {
        this.id = id;
        this.icon = icon;
        this.tone = tone;
        this.title = title;
        this.sub = sub;
        this.time = time;
        this.timestamp = timestamp != null ? timestamp : LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getIcon() { return icon; }
    public void setIcon(String icon) { this.icon = icon; }

    public String getTone() { return tone; }
    public void setTone(String tone) { this.tone = tone; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getSub() { return sub; }
    public void setSub(String sub) { this.sub = sub; }

    public String getTime() { return time; }
    public void setTime(String time) { this.time = time; }

    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }

    public static ActivityLogBuilder builder() { return new ActivityLogBuilder(); }

    public static class ActivityLogBuilder {
        private Long id;
        private String icon;
        private String tone;
        private String title;
        private String sub;
        private String time;
        private LocalDateTime timestamp = LocalDateTime.now();

        public ActivityLogBuilder id(Long id) { this.id = id; return this; }
        public ActivityLogBuilder icon(String icon) { this.icon = icon; return this; }
        public ActivityLogBuilder tone(String tone) { this.tone = tone; return this; }
        public ActivityLogBuilder title(String title) { this.title = title; return this; }
        public ActivityLogBuilder sub(String sub) { this.sub = sub; return this; }
        public ActivityLogBuilder time(String time) { this.time = time; return this; }
        public ActivityLogBuilder timestamp(LocalDateTime timestamp) { this.timestamp = timestamp; return this; }

        public ActivityLog build() {
            return new ActivityLog(id, icon, tone, title, sub, time, timestamp);
        }
    }
}
