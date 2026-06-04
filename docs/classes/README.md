# Class Architecture - AlToke

## Table of Contents

- [Architecture Overview](#overview)
- [Detailed Modules](#modules)
  - [Auth Module](#auth)
  - [User Module](#user)
  - [Task Module](#task)
  - [Gamification Module](#gamification)
  - [AI Module](#ai)
  - [Admin Module](#admin)
  - [Notification Module](#notification)

<a id="overview"></a>

## Architecture Overview

![Architecture Overview](assets/architecture.svg)

---

<a id="modules"></a>

## Detailed Modules

<a id="auth"></a>

### Auth Module

Strictly handles security and system access. It defines workflows for new user registration, local credentials validation (email/password), single sign-on (SSO) via Google, and session token issuance.
![Auth Module](assets/auth_module.svg)

<a id="user"></a>

### User Module

Manages identity and personal data within the platform. It handles public and private profile information, including avatar and nickname, as well as privacy preferences that dictate which statistics are visible to other users.
![User Module](assets/user_module.svg)

<a id="task"></a>

### Task Module

The functional core of the application. It enables the creation, edition, and logical deletion of tasks, events, and meetings. It implements task state logic and a 30-day temporary retention system in the trash before definitive deletion.
![Task Module](assets/task_module.svg)

<a id="gamification"></a>

### Gamification Module

Applies game mechanics to encourage productivity. It is responsible for awarding experience points (XP), calculating level-ups, tracking continuous activity streaks, and managing the item inventory (such as streak freezers) and unlockable achievements.
![Gamification Module](assets/gamification_module.svg)

<a id="ai"></a>

### AI Module

Introduces artificial intelligence capabilities to combat procrastination. It analyzes the user's performance history to suggest optimal execution times, predict workload overloads, and dynamically re-prioritize tasks based on received feedback.
![AI Module](assets/ai_module.svg)

<a id="admin"></a>

### Admin Module

Provides tools for global control and supervision. It facilitates institutional task assignment, monitors the overall state of the system through activity metrics, and handles the moderation of inappropriate content along with its respective audit log.
![Admin Module](assets/admin_module.svg)

<a id="notification"></a>

### Notification Module

Acts as the platform's communication hub. It consolidates and dispatches task expiration reminders, AI alerts, and system notices, always respecting the notification preferences (push, email, mute) configured by each user.
![Notification Module](assets/notification_module.svg)
