function extractInviteLink(email) {
    // Define the regex pattern to match the invitation link
    const inviteLinkRegex = /href="([^"]*?profile\/invitation\/[^"]*?)"/;
    // Search for the invitation link in the email body
    const match = email.body.match(inviteLinkRegex);
    // If a match is found, return the link; otherwise, return null
    return match ? match[1] : null;
}


module.exports = {
    extractInviteLink
  };