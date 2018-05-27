function genesis() {
  return true
}

function requestRide(x) {
  x.agent_id = App.Key.Hash
  x.agent_hash=App.Agent.Hash
  var key = commit("ride", x);
  commit("rides", {Links:[{Base:App.DNA.Hash,Link:key,Tag:"rides"}]})
  commit("agent_ride_link", { Links:[{
    Base: App.Key.Hash,
    Link: key,
    Tag: "ride"
  }]})
  return key
}

function isRideOnDNA(ride_entry) {
  debug("ride entry:"+JSON.stringify(ride_entry));
  var links = ride_entry.Links;
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

function isLinkFromSource(entry, sources) {
  if(entry.Links.length != 1) {
    debug("validation failed, expected agent_ride_link to contain exactly one link")
    return false
  }

  if(entry.Links[0].Base != sources[0]) {
    debug("validation failed, expected agent_ride_link to link from the source")
    return false
  }

  return true
}

function isSourcesOwnRide(entry, sources) {
  return sources[0] == entry.agent_id;
}

function validatePut(entry_type,entry,header,pkg,sources) {
    return validateCommit(entry_type,entry,header,pkg,sources)
}

function validateCommit(entry_type,entry,header,pkg,sources) {
  // rides all must happen on the DNA
  if (entry_type == "rides") {
      return isRideOnDNA(entry)
  }

  // can only link from my profile
  if (entry_type == "agent_ride_link" ){
      return isLinkFromSource(entry, sources)
  }

  // nobody can add somebody elses ride

  console.log("NOW HERE WITH", entry_type,entry,header,pkg,sources)

  return isSourcesOwnRide(entry, sources);
}
