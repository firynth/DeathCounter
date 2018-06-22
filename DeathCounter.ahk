#SingleInstance force ; if script is opened again, replace instance
#Persistent ; script stays in memory until ExitApp is called or script crashes

global title := "Interacting"

F6 Up::
    SetControlDelay -1
    SetTitleMatchMode, 1

    ControlSend, ahk_parent,{F6},%title%

    Return
F5 Up::
    SetControlDelay -1
    SetTitleMatchMode, 1

    ControlSend, ahk_parent,{F5},%title%

    Return
F4 Up::
    SetControlDelay -1
    SetTitleMatchMode, 1

    ControlSend, ahk_parent,{F4},%title%

    Return
F2 Up::
    SetControlDelay -1
    SetTitleMatchMode, 1

    ControlSend, ahk_parent,{F2},%title%

    Return