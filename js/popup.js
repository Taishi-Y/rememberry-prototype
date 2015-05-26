document.addEventListener('DOMContentLoaded', function () {
    var body = document.body,
        root = body.createShadowRoot();

    root.textContent = "Some text";
});