function checkPort() {

    const port = Number(
        document.getElementById("port").value
    );

    const result = document.getElementById("result");

    const ports = {

        21: "FTP - File Transfer Protocol",

        22: "SSH - Secure Shell",

        25: "SMTP - Email Transfer",

        53: "DNS - Domain Name System",

        80: "HTTP - Hypertext Transfer Protocol",

        110: "POP3 - Email Receiving",

        143: "IMAP - Email Access",

        443: "HTTPS - Secure Web Traffic",

        3306: "MySQL Database",

        3389: "Remote Desktop Protocol"

    };

    if (
        document.getElementById("port").value.trim() === "" ||
        !Number.isInteger(port) ||
        port < 0 ||
        port > 65535
    ) {

        result.innerHTML =
            "Please enter a valid port number between 0 and 65535.";

        return;

    }

    if (ports[port]) {

        result.innerHTML = `
            <h3>Port Information Found</h3>
            <p><strong>Port Number:</strong> ${port}</p>
            <p><strong>Service:</strong> ${ports[port]}</p>
            <p>This is a registered common service port.</p>
        `;

    } else {

        result.innerHTML = `
            <h3>Port Information</h3>
            <p><strong>Port Number:</strong> ${port}</p>
            <p>No service information is available in this demo database.</p>
        `;

    }

}