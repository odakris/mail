document.addEventListener("DOMContentLoaded", function () {
  // Use buttons to toggle between views
  document.querySelector("#inbox").addEventListener("click", () => load_mailbox("inbox"));
  document.querySelector("#sent").addEventListener("click", () => load_mailbox("sent"));
  document.querySelector("#archived").addEventListener("click", () => load_mailbox("archive"));
  document.querySelector("#compose").addEventListener("click", compose_email);

  // By default, load the inbox
  load_mailbox("inbox");

  // Handle sending mails form
  document.querySelector("#compose-form").addEventListener("submit", (e) => {
    // Prevent form submittion
    e.preventDefault();
    send_email();
  });
});

function compose_email() {
  // Show compose view and hide other views
  document.querySelector("#emails-view").style.display = "none";
  document.querySelector("#display-email-view").style.display = "none";
  document.querySelector("#compose-view").style.display = "block";

  // Clear out composition fields
  document.querySelector("#compose-recipients").value = "";
  document.querySelector("#compose-subject").value = "";
  document.querySelector("#compose-body").value = "";
}

function load_mailbox(mailbox) {
  // Show the mailbox and hide other views
  document.querySelector("#emails-view").style.display = "block";
  document.querySelector("#display-email-view").style.display = "none";
  document.querySelector("#compose-view").style.display = "none";

  // Show the mailbox name
  document.querySelector("#emails-view").innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  // Fetch 'mailbox' mails
  fetch(`/emails/${mailbox}`)
    .then((response) => response.json())
    .then((emails) => {
      const emailsView = document.getElementById("emails-view");

      emails.forEach((email) => {
        // Define email block
        const blockMail = document.createElement("div");
        blockMail.setAttribute("id", email.id);
        blockMail.classList.add("email", "flex");

        // Define sender / receiver div
        if (mailbox == "sent") {
          const receiver = document.createElement("div");
          receiver.classList.add("receiver");

          if (email.recipients.length > 1) {
            // If more than one receiver
            receiver.innerHTML = `To: ${email.recipients[0]} +${email.recipients.length - 1}`;
          } else {
            // If only one receiver
            receiver.innerHTML = `To: ${email.recipients}`;
          }

          blockMail.append(receiver);
        } else {
          const sender = document.createElement("div");
          sender.classList.add("sender");
          sender.innerHTML = `From: ${email.sender}`;
          blockMail.append(sender);
        }

        // Define subject div
        const subject = document.createElement("div");
        subject.classList.add("subject");
        subject.innerHTML = email.subject;
        blockMail.append(subject);

        // Define time div
        const time = document.createElement("div");
        time.classList.add("time");
        time.innerHTML = email.timestamp;
        blockMail.append(time);

        // Load email on click
        blockMail.addEventListener("click", () => display_email(email.id));

        // Append new email
        emailsView.append(blockMail);
      });
    });
}

function display_email(id) {
  // Show compose view and hide other views
  document.querySelector("#emails-view").style.display = "none";
  document.querySelector("#compose-view").style.display = "none";
  document.querySelector("#display-email-view").style.display = "block";

  fetch(`/emails/${id}`)
    .then((response) => response.json())
    .then((result) => {
      console.log(result);
      const displayEmail = document.querySelector("#display-email-view");

      // Show the Mail Subject
      displayEmail.innerHTML = `<h3>${result.subject}</h3>`;

      // Show email details
      const emailDetails = document.createElement("div");

      // From
      const emailFrom = document.createElement("div");
      emailFrom.classList.add("email-from");
      emailFrom.innerHTML = `From: ${result.sender}`;

      // To
      const emailTo = document.createElement("div");
      emailTo.classList.add("email-to");
      emailTo.innerHTML = `To: ${result.recipients}`;

      // Time
      const emailTime = document.createElement("div");
      emailTime.classList.add("email-time");
      emailTime.innerHTML = result.timestamp;

      // Email body
      const emailBody = document.createElement("div");
      emailBody.classList.add("email-body");
      emailBody.innerHTML = result.body;

      emailDetails.append(emailFrom, emailTo, emailTime, emailBody);

      displayEmail.append(emailDetails);
    })
    .catch((error) => console.log(error));
}

function send_email() {
  // Send mail
  fetch("/emails", {
    method: "POST",
    body: JSON.stringify({
      recipients: document.querySelector("#compose-recipients").value,
      subject: document.querySelector("#compose-subject").value,
      body: document.querySelector("#compose-body").value,
    }),
  })
    .then((response) => response.json())
    .then((result) => {
      console.log(result);
      // redirect to sent messages
      load_mailbox("sent");
    })
    .catch((error) => console.log(error));
}
