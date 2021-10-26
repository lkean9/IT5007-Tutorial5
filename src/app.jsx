// import "mystyle.css";

class DisplayHomepage extends React.Component {
  render() {

    return (
      <div>
        <h1>Hotel California Waitlist Management System</h1>

        <DisplayFreeSlots reservations={this.props.reservations} />

        <div id="Welcome_Page">
          <h2>Welcome to the Hotel California Waitlist Management System!</h2>
          <p>
            This is a brief introduction of the waiting list management system. The maximum size of the wait list is 25. If the reservation reaches the maximum size, any new reservation request will be denied until there is any free slot available. In this system, what you can do is:
          </p>
          <ul>
            <li>Reserve a seat by filling in customer's name and phone number.</li>
            <ul>
              <li>If the waiting list is full, it will display <i>The waiting list is full, cannot reserve seat!</i></li>
            </ul>
            <li>Remove an existing reservation by keying in the corresponding serial number.</li>
            <ul>
              <li>If the serial number you provide does not exist, it will display <i>The Serial Number Doesn't Exist!</i></li>
              <li>If the serial number you provide is invalid (e.g. negative number or string), it will display <i>The Serial Number Shall Be a Postive Number!</i></li>
            </ul>
          </ul>
          <br />
        </div>
      </div>
    );
  }
}

class AddCustomer extends React.Component {
  constructor() {
    super();
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleSubmit(e) {
    e.preventDefault();
    if (this.props.reservations.length === 25) {
      alert("The waiting list is full, cannot reserve seat!");
      return;
    }

    const firstNameField = document.getElementById("firstName");
    const lastNameField = document.getElementById("lastName");
    const phoneNoField = document.getElementById("phoneNumber");
    const reservation = {
      firstName: firstNameField.value,
      lastName: lastNameField.value,
      phoneNo: phoneNoField.value,
    }
    this.props.createReservation(reservation);
    firstNameField.value = "";
    lastNameField.value = "";
    phoneNoField.value = "";
    alert("Successfully Reserved!");
  }

  render() {
    return (
      <div id="reserve">
        <h3><span style={{ textDecorationLine: "underline" }}>Reserve</span> - register a guest into the waitlist, please fill in customer's name and phone number:</h3>
        <label htmlFor="First Name">First Name</label>
        <input type="text" id="firstName"></input>
        <label htmlFor="last name">Last Name</label>
        <input type="text" id="lastName"></input>
        <label htmlFor="phone number">Phone Number</label>
        <input type="text" id="phoneNumber"></input>
        <button onClick={this.handleSubmit}>Reserve</button>
      </div>
    );
  }
}

class DeleteCustomer extends React.Component {
  constructor() {
    super();
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleSubmit(e) {
    e.preventDefault();
    const serialNoField = document.getElementById("serialNumber");
    var serialNo = Number(serialNoField.value);

    if (isNaN(serialNo) || serialNo <= 0) {
      alert("The Serial Number Shall Be a Postive Number!");
      serialNoField.value = "";
      return;
    }

    for (var index = 0; index < this.props.reservations.length; index++) {
      if (this.props.reservations[index].serialNo === serialNo) {
        break;
      }
    }

    if (index === this.props.reservations.length) {
      alert("The Serial Number Doesn't Exist!");
      serialNoField.value = "";
      return;
    }

    var r = confirm("Confirmed to remove?");
    if (r === true) {
      this.props.removeReservation(serialNo);
    }

    serialNoField.value = "";
  }

  render() {
    return (
      <div id="remove">
        <h3><span style={{ textDecorationLine: "underline" }}>Remove</span> - To remove a reservation from the waitlist, please fill in customer's corresponding serial number:</h3>
        <label htmlFor="serial number">Serial Number</label>
        <input type="text" id="serialNumber"></input>
        <button onClick={this.handleSubmit}>Remove</button>
      </div>
    );
  }
}

class WaitlistRow extends React.Component {
  render() {
    const reservation = this.props.reservation;
    return (
      <tr>
        <td>{reservation.serialNo}</td>
        <td>{reservation.firstName}</td>
        <td>{reservation.lastName}</td>
        <td>{reservation.phoneNo}</td>
        <td>{reservation.timestamp}</td>
      </tr>
    );
  }
}

class DisplayCustomers extends React.Component {
  render() {
    const waitlistRows = this.props.reservations.map(reservation => <WaitlistRow key={reservation.serialNo} reservation={reservation} />);
    return (
      <table>
        <thead>
          <tr>
            <th>Serial Number</th>
            <th>First Name</th>
            <th>Last Name</th>
            <th>Phone Number</th>
            <th>Timestamp</th>
          </tr>
        </thead>
        <tbody>
          {waitlistRows}
        </tbody>
      </table>
    );
  }
}

class DisplayFreeSlots extends React.Component {
  render() {
    const len = this.props.reservations.length;
    return (
      <div className="Outline">
        <h2 id="today">Today is {new Date().toLocaleDateString()}. </h2>
        <h2 id="curSlots">There are currently {25 - len} free slots available.</h2>
      </div>
    );
  }
}

class WaitlistSystem extends React.Component {
  constructor() {
    super();
    this.state = {reservations: [], SN: 0};
    this.createReservation = this.createReservation.bind(this);
    this.removeReservation = this.removeReservation.bind(this);
  }

  componentDidMount() {
    this.loadData();
  }

  async loadData() {
    const query = `query {
      reservationList {
        serialNo firstName lastName phoneNo timestamp
      }
    }`;

    const response = await fetch("/graphql", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({query})
    });
    const result = await response.json();
    this.setState({reservations: result.data.reservationList});
  }

  async createReservation(reservation) {
    const query = `mutation reservationAdd($reservation: ReservationInputs!) {
      reservationAdd(reservation: $reservation) {
        serialNo
      }
    }`;

    const response = await fetch("/graphql", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({query, variables: {reservation}})
    });
    this.loadData();
  }

  async removeReservation(serialNo) {
    const query = `mutation reservationDelete($serialNo: Int!) {
      reservationDelete(serialNo: $serialNo)
    }`;

    const response = await fetch("/graphql", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({query, variables: {serialNo}})
    });
    this.loadData();
  }

  render() {
    return (
      <React.Fragment>
        <DisplayHomepage reservations={this.state.reservations} />
        <hr />
        <DisplayCustomers reservations={this.state.reservations} />
        <hr />
        <br />
        <AddCustomer createReservation={this.createReservation} reservations={this.state.reservations}/>
        <br />
        <hr />
        <br />
        <DeleteCustomer removeReservation={this.removeReservation} reservations={this.state.reservations} />
        <br />
      </React.Fragment>
    );
  }
}

const element = <WaitlistSystem />
ReactDOM.render(element, document.getElementById("WaitlistSystem"));