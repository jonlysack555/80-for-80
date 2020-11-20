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
var perDone;

document.getElementById("progress").addEventListener("mouseover", showIt);

function showIt() {
  if (document.getElementById("progress").value == 100) {
    document.getElementById("labelled").style.left = "290px";
  } else {
    document.getElementById("labelled").style.left = eval((1.75*(document.getElementById("progress").value))+110) + "px";
  }
  document.getElementById("labelled").innerHTML = (document.getElementById("progress").value).toFixed(2) + "%";
  console.log("percent");
}

document.getElementById("progress").addEventListener("mouseout", hideIt);

function hideIt() {
  document.getElementById("labelled").innerHTML = "";
  console.log("percent off");
}

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
      var pubRemain = "80km Left";
      document.getElementById('total').innerHTML = pubRemain;
      perDone = 0;
      document.getElementById("progress").value = perDone;
    } else if (response.data.custom.tot <= 0) {
      console.log("we got him");
      var pubRemain  = (eval(-1*response.data.custom.tot)).toFixed(2) + "km over our 80km goal!";
      document.getElementById('total').innerHTML = pubRemain;
      perDone = 100;
      document.getElementById("progress").value = perDone;
    } else {
      var pubRemain = (response.data.custom.tot).toFixed(2) + "km Left";
      document.getElementById('total').innerHTML = pubRemain;
      perDone = (1-(response.data.custom.tot/80))*100;
      document.getElementById("progress").value = perDone;
    }
  }
);

updateTotal = function(distance){
  total = document.getElementById('total').innerHTML;
  console.log(typeof total)
  total = parseFloat(total);
  console.log(total);
  if ((document.getElementById('total').innerHTML).includes("over our")) {
    total += distance;
    total = total * -1;
  } else {
    total -= distance;
  }
  pubTotal = total;
  if (total <= 0 || (document.getElementById('total').innerHTML).includes("over our")) {
    total = (eval(-1*total)).toFixed(2) + "km over our 80km goal!";
    perDone = 100;
    document.getElementById("progress").value = perDone;
  } else {
    perDone = (1-(total/80))*100;
    document.getElementById("progress").value = perDone;
    total = "" + total.toFixed(2) + "km Left";
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
    newText = "" + ((inputs[0].value).toLowerCase()).charAt(0).toUpperCase() + ((inputs[0].value).toLowerCase()).slice(1) + " completed " + inputs[2].value + "km while " + (inputs[1].value).toLowerCase() + "!\n";
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
