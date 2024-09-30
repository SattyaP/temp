const { ipcRenderer } = require("electron");

ipcRenderer.send("get-qrcode");
ipcRenderer.on("qr-generated", (event, qrUrl) => {
    console.log("QR code generated");
    document.getElementById("qrcode").src = qrUrl;
    document.getElementById("loader").style.display = "none";
    document.getElementById("qrcode").style.display = "block";
});

ipcRenderer.on("groups", (event, groups) => {
    const groupsContainer = document.getElementById("groups");
    groupsContainer.innerHTML = "";

    groups.forEach((group) => {
        const groupDiv = document.createElement("div");
        groupDiv.className = "group";
        groupDiv.textContent = group.name;
        groupsContainer.appendChild(groupDiv);
    });
});
