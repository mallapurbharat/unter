function genesis() {
  return true
}

function isRegistrationOnDNA(registration_entry) {
  debug("registration entry:"+JSON.stringify(registration_entry));
  var links = registration_entry.Links;
  for(var i=0; i < links.length; i++) {
      var l = links[i]
      debug("link: "+JSON.stringify(l))

      if (l.Base != App.DNA.Hash) {
          debug("validation failed, expected reg base to be: "+App.DNA.Hash+" but was: "+l.Base)
          return false;
      }
  }
  return true;
}

function isSourcesOwnProfile(entry, sources) {
  return sources[0] == entry.agent_id;
}

function isLinkFromSource(entry, sources) {
  if(entry.Links.length != 1) {
    debug("validation failed, expected agent_user_link to contain exactly one link")
    return false
  }

  if(entry.Links[0].Base != sources[0]) {
    debug("validation failed, expected agent_user_link to link from the source")
    return false
  }

  return true
}

function validatePut(entry_type,entry,header,pkg,sources) {
    return validateCommit(entry_type,entry,header,pkg,sources)
}

function validateCommit(entry_type,entry,header,pkg,sources) {
    // registrations all must happen on the DNA
    if (entry_type == "registrations") {
        return isRegistrationOnDNA(entry)
    }

    // can only link from my profile
    if (entry_type == "agent_user_link" ){
        return isLinkFromSource(entry, sources)
    }

    // nobody can add somebody elses profile
    return isSourcesOwnProfile(entry, sources);
}

// Register new user
function register(x) {
  x.agent_id = App.Key.Hash
  x.agent_hash=App.Agent.Hash
  var key = commit("user", x);
  commit("registrations", {Links:[{Base:App.DNA.Hash,Link:key,Tag:"registered_users"}]})
  commit("agent_user_link", { Links:[{
    Base: App.Key.Hash,
    Link: key,
    Tag: "user"
  }]})
  return key
}
