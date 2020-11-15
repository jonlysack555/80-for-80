pubnub = new PubNub({
  publishKey: "pub-c-8bb55289-ec2d-4e9c-9021-5ee02541074b",
  subscribeKey: "sub-c-727ddb38-25e4-11eb-862a-82af91a3b28d",
  uuid: "user"
});

pubnub.subscribe({
  channels: ['users'],
  withPresence: true
});

var pubList;
var pubTotal;

pubnub.getUser({
  userId: "theList",
  include: {
    customFields: true
  }
},
  function(status, response){
    console.log(response);
    console.log("got List");
    console.log(status);
    /*if(response.data.custom.pass == pass){
      openSelectionPage(response.data.id, response.data.name, response.data.custom.pass);
    }*/
    pubList = JSON.parse(response.data.custom.pass);
    console.log(pubList);
    for (i of pubList){
      addElementToList(i);
    }
    if (response.data.custom.tot == undefined || response.data.custom.tot == "") {
      var pubRemain = "80kms Left";
      document.getElementById('total').innerHTML = pubRemain;
    } else if (response.data.custom.tot <= 0) {
      console.log("we got him");
      var pubRemain  = "Goal completed! " + eval(-1*response.data.custom.tot) + "kms over our goal.";
      document.getElementById('total').innerHTML = pubRemain;
    } else {
      var pubRemain = response.data.custom.tot + "kms Left";
      document.getElementById('total').innerHTML = pubRemain;
    }
  }
);

updateTotal = function(distance){
  total = document.getElementById('total').innerHTML;
  console.log(typeof total)
  total = parseFloat(total);
  console.log(total);
  total -= distance;
  pubTotal = total;
  if (total <= 0) {
    total = "Goal completed! " + eval(-1*total) + "kms over our goal.";
  } else {
    total = "" + total + "kms Left";
  }
  document.getElementById('total').innerHTML = total;
}

inputs = document.getElementsByName('input');
for (i = 0; i < inputs.length; i++){
  inputs[i].addEventListener('blur', function(){
    if(this.id == 'distance' && isNaN(parseFloat(this.value))){
      this.value = "";
    }
  });
}

addElementToList = function(newText){
  li = document.getElementById('list');
  node = document.createElement("LI");
  textNode = document.createTextNode(newText);
  node.appendChild(textNode)
  li.appendChild(node);
}

document.getElementById('submit').addEventListener('click', function(){
  if (inputs[0].value != "" && inputs[1].value != "" && inputs[2].value != "" && inputs[0].value != null && inputs[1].value != null && inputs[2].value != null) {
    newText = "" + ((inputs[0].value).toLowerCase()).charAt(0).toUpperCase() + ((inputs[0].value).toLowerCase()).slice(1) + " completed " + inputs[2].value + "kms while " + (inputs[1].value).toLowerCase() + "!\n";
    addElementToList(newText);
    textNodesText = [];
    for (i of document.getElementById('list').children){
      textNodesText.push(i.innerHTML);
    }
    console.log(textNodesText);
    updateTotal(parseFloat(inputs[2].value));
    for(i of inputs){
      i.value = "";
    }
    pubnub.updateUser({
      id: 'theList',
      name: "theName",
      custom: {
        pass: JSON.stringify(textNodesText),
        tot: pubTotal
      }
    });
  } else {
    alert("Please fill all fields.")
  }
});
