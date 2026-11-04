#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
use tauri::menu::{Menu, MenuItem};
use tauri::tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent};
use tauri::{Manager, WebviewUrl, WebviewWindowBuilder};
use tauri_plugin_dialog::DialogExt;
use tauri_plugin_notification::NotificationExt;

fn show_main(app: &tauri::AppHandle) {
    if let Some(window) = app.get_webview_window("main") {
        let _ = window.unminimize();
        let _ = window.show();
        let _ = window.set_focus();
    }
}
#[tauri::command]
async fn open_widget(app: tauri::AppHandle) -> Result<(), String> {
    if let Some(window) = app.get_webview_window("widget") {
        window.show().map_err(|e| e.to_string())?;
        return window.set_focus().map_err(|e| e.to_string());
    }
    WebviewWindowBuilder::new(&app, "widget", WebviewUrl::App("widget.html".into()))
        .title("薪情不错 · 悬浮窗")
        .inner_size(360.0, 240.0)
        .min_inner_size(310.0, 220.0)
        .decorations(false)
        .always_on_top(true)
        .skip_taskbar(true)
        .resizable(true)
        .build()
        .map(|_| ())
        .map_err(|e| e.to_string())
}
#[tauri::command]
fn open_main(app: tauri::AppHandle) {
    show_main(&app);
}
#[tauri::command]
fn hide_widget(app: tauri::AppHandle) -> Result<(), String> {
    if let Some(w) = app.get_webview_window("widget") {
        w.hide().map_err(|e| e.to_string())?;
    }
    Ok(())
}
#[tauri::command]
fn pin_widget(app: tauri::AppHandle, pinned: bool) -> Result<(), String> {
    if let Some(w) = app.get_webview_window("widget") {
        w.set_always_on_top(pinned).map_err(|e| e.to_string())?;
    }
    Ok(())
}
#[tauri::command]
fn notify_shift(app: tauri::AppHandle) -> Result<(), String> {
    app.notification()
        .builder()
        .title("薪情不错 · 快乐下班")
        .body("今天的努力已经完成，下班后的时间属于你。")
        .show()
        .map_err(|e| e.to_string())
}
#[tauri::command]
async fn export_backup(app: tauri::AppHandle, contents: String) -> Result<bool, String> {
    if contents.len() > 500_000 {
        return Err("备份文件过大".into());
    }
    tauri::async_runtime::spawn_blocking(move || {
        let path = app
            .dialog()
            .file()
            .set_file_name("salary-cheer-backup.json")
            .add_filter("JSON", &["json"])
            .blocking_save_file();
        match path {
            Some(p) => {
                let p = p.into_path().map_err(|e| e.to_string())?;
                std::fs::write(p, contents).map_err(|e| e.to_string())?;
                Ok(true)
            }
            None => Ok(false),
        }
    })
    .await
    .map_err(|e| e.to_string())?
}
fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_single_instance::init(|app, _, _| {
            show_main(app)
        }))
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_notification::init())
        .invoke_handler(tauri::generate_handler![
            open_widget,
            open_main,
            hide_widget,
            pin_widget,
            notify_shift,
            export_backup
        ])
        .on_window_event(|w, event| {
            if let tauri::WindowEvent::CloseRequested { api, .. } = event {
                if w.app_handle().tray_by_id("main-tray").is_some() {
                    api.prevent_close();
                    let _ = w.hide();
                }
            }
        })
        .setup(|app| {
            let show = MenuItem::with_id(app, "show", "打开主面板", true, None::<&str>)?;
            let widget = MenuItem::with_id(app, "widget", "打开收入悬浮窗", true, None::<&str>)?;
            let quit = MenuItem::with_id(app, "quit", "退出薪情不错", true, None::<&str>)?;
            let menu = Menu::with_items(app, &[&show, &widget, &quit])?;
            let icon = tauri::image::Image::from_bytes(include_bytes!("../icons/32x32.png"))?;
            let tray = TrayIconBuilder::with_id("main-tray")
                .icon(icon)
                .tooltip("薪情不错 · 每一秒都有小收获")
                .menu(&menu)
                .show_menu_on_left_click(false)
                .on_menu_event(|app, event| match event.id.as_ref() {
                    "show" => show_main(app),
                    "widget" => {
                        let handle = app.clone();
                        tauri::async_runtime::spawn(async move {
                            let _ = open_widget(handle).await;
                        });
                    }
                    "quit" => app.exit(0),
                    _ => {}
                })
                .on_tray_icon_event(|tray, event| {
                    if let TrayIconEvent::Click {
                        button: MouseButton::Left,
                        button_state: MouseButtonState::Up,
                        ..
                    } = event
                    {
                        show_main(tray.app_handle());
                    }
                })
                .build(app);
            // If a desktop has no tray support, retain normal close behavior.
            if let Err(e) = tray {
                eprintln!("Tray unavailable: {e}");
            }
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("无法启动薪情不错");
}
