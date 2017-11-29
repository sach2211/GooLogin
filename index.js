const get = require('lodash/get');
/**
 *
 * Google-Login
 * reference from : https://github.com/google/google-api-javascript-client/blob/master/samples/authSample.html
 */

export default class GooLogin {
  constructor(tokenPostURL, postBody, id = "", mode) {
    this.tokenPostURL = tokenPostURL;
    this.postBody = postBody;
    // this.credId = id;
    // this.credMode = mode;
  }

  /* Is gapi available */
  gLogin() {
    if (get(window, "gapi.auth2")) {
      let gAuth = window.gapi.auth2.getAuthInstance();
      let currentUser;

      /* Register a listener to detect a change in login state */
      gAuth.isSignedIn.listen(loggedIn => {
        if (loggedIn && this.chosenAccountMatchesLoggedinAccount(gAuth.currentUser.get())) {
          this.postToken(gAuth.currentUser.get());
        }
      });

      /* Is user logged in through the same account he chose in Browser Account Chooser UI ? */
      if (gAuth.isSignedIn.get() && this.chosenAccountMatchesLoggedinAccount(gAuth.currentUser.get())) {
        this.postToken(gAuth.currentUser.get());
      } else {
        /* User is not logged in through same (or any other) account, open Google login view */
        /* Show login hint, if applicable (as in case of CM api) */
        gAuth.signIn({
          login_hint: id || ""
        });
      }
    } else {
      console.error("An error in auth2 init");
      return false;
    }
  }

  chosenAccountMatchesLoggedinAccount(currentUser) {
    let profile = currentUser.getBasicProfile();
    if (!id || profile.getEmail() === id) {
      return true;
    }
    return false;
  }

  postToken(currentUser) {
    this.postBody.access_token= get(currentUser, "Zi.access_token");
    agent
      .post(this.tokenPostURL)
      .send(this.postBody)
      .end((err, resp) => {
        if (!agent.handleErrors(err, resp)) {
          let basicProfile = currentUser.getBasicProfile();
          credentials.storeFederatedCredentials(
            basicProfile.getEmail(),
            basicProfile.getName(),
            basicProfile.getImageUrl(),
            "google"
          );
          success(); // additional tasks in case of success.
          return;
        }
        console.error("Google login posting failed - ", err);
      });
  }
};