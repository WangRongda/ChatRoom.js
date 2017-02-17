var notification = [];
var i = 1;
if (window.Notification) {
    if (Notification.permission === 'granted') {
        notification[i] = new Notification('title', {
            body: "message \  message",
            icon: "http://115.159.75.162/dan.png",
            silent : false,
            sound: 'http://115.159.75.162/notify.mp3'
        });
        notification[i].onclick = function() {
            window.focus();
            while (--i) {
                notification[i].close();
            }
        }
        i++;
    }
    else {
            Notification.requestPermission();
    }
}
else alert('你的浏览器不支持消息提示');
