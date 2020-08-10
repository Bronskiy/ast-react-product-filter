'use strict';

const Router = window.ReactRouterDOM.BrowserRouter;
const Link =  window.ReactRouterDOM.Link;
const PropTypes = window.PropTypes.PropTypes;
const withRouter = window.ReactRouterDOM.withRouter;

const e = React.createElement;

//convert API filter values to select options format
function parseFilterData(vals){
  return vals.map((val) => {
    return { label: val, value: val };
  });
}

//get query string parameters
function parseUrlData(vals){
  if(vals != null && vals != undefined) {
    var valsArr = vals.split(',');
    return parseFilterData(valsArr);
  }
}

//make query string from array
function arrayToGetUrl(valueName, object){

  var parameters = [];
  var count = 0;
  for (var property in object) {
    if (object.hasOwnProperty(property)) {
        parameters.push(encodeURI((count === 0 ? valueName  + '=' : '') + object[property].value));
      }
      count++;
    }

    return parameters.join(',');
}

// TODO: 'Clear' button
class ReplaceTwigContent extends React.Component {
  render() {
    return (
      <div>
        <a href="/product-finder" class="btn btn-primary btn-product-clear">Clear</a>
      </div>
    );
  }
}

class AllFilterData extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      searchValue: "",
      searched: "",
      adjustment: [],
      adjustmentSelected: [],
      adjustmentValue: [],
      make: [],
      makeSelected: [],
      makeValue: [],
      model: [],
      modelSelected: [],
      modelValue: [],
      chassis: [],
      chassisSelected: [],
      chassisValue: [],
      system: [],
      systemSelected: [],
      systemValue: [],
      updatedSelected: 'no',
      updatedSearch: 'no',
      updatedPage: 'no',
      data: [],
      meta: [],
      //error: null
    }
  }

  propertiesInputChange = (e) => {
    this.updateSelected();
  };

  linkClicked = (pageNumber) => {
    this.setState({
      updatedSelected: 'yes',
      meta: {
        current_page:  pageNumber ? pageNumber : null,
      },
    });
  };

  handleSearch = (e) => {
    this.setState({
      searched: e.target.value,
      updatedSelected: 'yes',
    });
  };

  componentDidUpdate() {
    if (this.state.updatedSelected == 'yes') {
      this.makeApiCall();
    } else if (this.state.updatedSearch == 'yes') {
      this.makeApiCall();
    } else if (this.state.updatedPage == 'yes') {
      this.makeApiCall();
    }
    window.onpopstate = e => {
      this.updatePage();
      this.updateSelected();
      // this.getFilterData();
    }
  }

  componentWillMount() {
    this.updatePage();
    this.updateSelected();
    this.getFilterData();
  }

  getFilterUpdatedData(url) {
    fetch(url)
    .then(response => {
      return response.json();
    })
    .then(jsonData => {
      var arrAdjustment = [];
      var arrMake = [];
      var arrModel = [];
      var arrChassis = [];
      var arrSystem = [];
      jsonData.data.map((product, index) => (
        arrAdjustment.findIndex(x => x.label == product.adjustment.label) == -1 && product.adjustment.label != null ? arrAdjustment.push({ label: product.adjustment.label, value: product.adjustment.label }) : "",
        arrMake.findIndex(x => x.label == product.make.label) == -1 && product.make.label != null  ? arrMake.push({ label: product.make.label, value: product.make.label }) : "",
        arrModel.findIndex(x => x.label == product.model) == -1 && product.model != null  ? arrModel.push({ label: product.model, value: product.model }) : "",
        arrChassis.findIndex(x => x.label == product.chassis) == -1 && product.chassis != null  ? arrChassis.push({ label: product.chassis, value: product.chassis }) : "",
        arrSystem.findIndex(x => x.label == product.system.label) == -1 && product.system.label != null  ? arrSystem.push({ label: product.system.label, value: product.system.label }) : ""
      ))

      let sortFunction = (a, b) => {
       return a.label < b.label ? -1 : 1;
      };
//sort filters values alphabeticaly
      arrAdjustment.sort(sortFunction);
      arrMake.sort(sortFunction);
      arrModel.sort(sortFunction);
      arrChassis.sort(sortFunction);
      arrSystem.sort(sortFunction);

      this.setState({
        adjustment: arrAdjustment,
        make: arrMake,
        model: arrModel,
        chassis: arrChassis,
        system: arrSystem,
       })
    });
  }

//call to backend to fetch results from the DB based on selected filters
  makeApiCall() {
    var searchUrl = `/api/search?s=${this.state.searched}`
      +'&'
      +arrayToGetUrl('adjustmentValue' ,this.state.adjustmentSelected)
      +'&'
      +arrayToGetUrl('makeValue' ,this.state.makeSelected)
      +'&'
      +arrayToGetUrl('modelValue' ,this.state.modelSelected)
      +'&'
      +arrayToGetUrl('chassisValue' ,this.state.chassisSelected)
      +'&'
      +arrayToGetUrl('systemValue' ,this.state.systemSelected)
      +'&page='+`${this.state.meta['current_page']}`;
      var searchUrlWithoutLimit = searchUrl + '&per_page=9999';

      this.getFilterUpdatedData(searchUrlWithoutLimit);

    fetch(searchUrl)
    .then(response => {
      return response.json();
    })
    .then(jsonData => {
      this.setState({
        //products
        data: jsonData.data,
        //pagination
        meta: {
          total_pages:  jsonData.meta.pagination['total_pages'],
          current_page:  jsonData.meta.pagination['current_page'],
          previous:  new URLSearchParams(jsonData.meta.pagination['links']['previous']).get('page'),
          next:  new URLSearchParams(jsonData.meta.pagination['links']['next']).get('page'),
        },
       });
    });
    this.setState({
      //switch markers to 'no' when data received
      updatedSelected: 'no',
      updatedSearch: 'no',
    });
  }
  render() {
    return (
      <div>
      <h1>Product Finder</h1>
      <div class="row">
        <div class="col-md-12">
          <h2>Search</h2>
          <SearchComponent filterName="search" properties={this.state.search} searched={this.state.searched} onInputChange={this.handleSearch} />
          </div>
        </div>
        <div class="row mt20">
        <div class="col-md">
          <div class="mb-3">
            <h5>Adjustment</h5>
            <SelectFilter filterName="adjustment" properties={this.state.adjustment} selected={this.state.adjustmentSelected} onSelectChange={this.propertiesInputChange} />
          </div>
        </div>
        <div class="col-md">
          <div class="mb-3">
            <h5>Make</h5>
            <SelectFilter filterName="make" properties={this.state.make} selected={this.state.makeSelected} onSelectChange={this.propertiesInputChange} />
          </div>
        </div>
        <div class="col-md">
          <div class="mb-3">
            <h5>Model</h5>
            <SelectFilter filterName="model" properties={this.state.model} selected={this.state.modelSelected} onSelectChange={this.propertiesInputChange} />
          </div>
        </div>
        <div class="col-md">
          <div class="mb-3">
            <h5>Chassis</h5>
            <SelectFilter filterName="chassis" properties={this.state.chassis} selected={this.state.chassisSelected} onSelectChange={this.propertiesInputChange} />
          </div>
        </div>
        <div class="col-md">
          <div class="mb-3">
            <h5>System</h5>
            <SelectFilter filterName="system" properties={this.state.system} selected={this.state.systemSelected} onSelectChange={this.propertiesInputChange} />
          </div>
        </div>
        </div>
          <TableData rowData={this.state.data} />
          <PaginationComponent metaData={this.state.meta} onLinkClick={this.linkClicked}/>
      </div>
    )
  }
  //call to backend to receive filters/selectors options
  getFilterData() {
    fetch('/json/filters')
    .then(response => {
      return response.json();
    })
    .then(jsonData => {
      this.setState({
        // filter's options
        adjustment: parseFilterData(jsonData.adjustment),
        make: parseFilterData(jsonData.make),
        model: parseFilterData(jsonData.model),
        chassis: parseFilterData(jsonData.chassis),
        system: parseFilterData(jsonData.system),
      });
    });
  }

//update current page stored value
  updatePage() {
    var currentUrlParams = new URLSearchParams(window.location.search);

    this.setState({
      meta: {
        current_page:  currentUrlParams.get('page') ? currentUrlParams.get('page') : "",
      },
    });
  }

//update values that user selected
  updateSelected() {
    let currentUrlParams = new URLSearchParams(window.location.search);

    this.setState({
      searched: currentUrlParams.get('search') ? currentUrlParams.get('search') : "",
      adjustmentSelected: parseUrlData(currentUrlParams.get('adjustment')),
      makeSelected: parseUrlData(currentUrlParams.get('make')),
      modelSelected: parseUrlData(currentUrlParams.get('model')),
      chassisSelected: parseUrlData(currentUrlParams.get('chassis')),
      systemSelected: parseUrlData(currentUrlParams.get('system')),
      updatedSelected: 'yes',
    });
  }
}

class TableData extends React.Component {

  render() {
    return (
    <div class="row">
      {this.props.rowData ? (
        <div class="col-md table-responsive">
          <table class="table table-striped table-hover">
            <thead>
              <tr>
                <th scope="col">Part Number</th>
                <th scope="col">Adjustment/System</th>
                <th scope="col">Make</th>
                <th scope="col">Model</th>
                <th scope="col">Chassis</th>
                <th scope="col">Product</th>
                <th scope="col">Model Years</th>
              </tr>
            </thead>
            <tbody>
              {this.props.rowData.map((product, index) => (
                <tr key={index}>
                <td><a href={product.url}>{product.title}</a></td>
                <td>{product.adjustment.label ? product.adjustment.label : '-'}</td>
                <td>{product.make.label ? product.make.label : '-'}</td>
                <td>{product.model ? product.model : '-'}</td>
                <td>{product.chassis ? product.chassis : '-'}</td>
                <td>{product.product ? product.product : '-'}</td>
                <td>{product.startMY ? (product.startMY + ' - ') : ''}{product.endMY}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div class="col-md">
          <p>Try searching for a product</p>
        </div>
      )}
      </div>
    )
  }
}

class DropDownCommonSelect extends React.Component {
  // state = {
  //   selectedOption: null,
  // };

  propertiesInputChange = (e) => {
    // this.setState({selectedOption: e});

    let currentUrlParams = new URLSearchParams(window.location.search);
    var modelValue = [];
    e.map((key, value) => (
      modelValue.push(key.value)
    ));

    modelValue.join() ? currentUrlParams.set(`${this.props.filterName}`, modelValue.join()) : currentUrlParams.delete(`${this.props.filterName}`);
    currentUrlParams.get('page') ? currentUrlParams.delete('page') : currentUrlParams;
    //add selected parameters to the URL as query string
    this.props.history.push(window.location.pathname + "?" + currentUrlParams.toString());
    this.props.onSelectChange(e);
  }

  render() {
    // const { selectedOption } = this.state;

    return (
      <Select
          isMulti
          name={this.props.filterName}
          className="basic-multi-select"
          classNamePrefix="select"
          options={this.props.properties}
          value={this.props.selected != undefined ? this.props.selected : null}
          onChange={this.propertiesInputChange}
      />
    );
  }
}

class SearchInput extends React.Component {

  state = {
    searchedItem: '',
  };

  propertiesInputChange = (e) => {
    this.setState({searchedItem: e.target.value});

    let currentUrlParams = new URLSearchParams(window.location.search);

    e.target.value ? currentUrlParams.set(`${this.props.filterName}`, e.target.value) : currentUrlParams.delete(`${this.props.filterName}`);
    this.props.history.push(window.location.pathname + "?" + currentUrlParams.toString());
    this.props.onInputChange(e);
  }

  formSearchSubmit = (e) => {
    e.preventDefault();
  };

  render() {
    const { searchedItem } = this.state;

    return (
      <form onSubmit={this.formSearchSubmit} class="card p-2">
        <div class="input-group">
          <input
            name="search"
            type="text"
            class="form-control"
            placeholder="Search our products"
            onChange={event => this.propertiesInputChange(event)}
            value={searchedItem ? searchedItem : this.props.searched}
          />
          <div class="input-group-append">
            <button type="submit" class="btn btn-secondary">Search</button>
          </div>
        </div>
      </form>
    )
  }
}

class Pagination extends React.Component {
  linkHandle = (e) => {
    this.props.onLinkClick(e);
  }

//create link for each button in pagination element
  getPageLink(pageNumber) {
    let currentUrlParams = new URLSearchParams(window.location.search);

    pageNumber ? currentUrlParams.set('page', pageNumber) : currentUrlParams;
    return window.location.pathname + "?" + currentUrlParams.toString();
  }

  render() {
    return (
      <div class="pagination-wrapper">
      {this.props.metaData ? (
        this.props.metaData['total_pages'] > 1 ? (

        <div>
        {this.props.metaData['previous'] ? (
          <Link to={this.getPageLink(this.props.metaData['previous'])} onClick={event => this.linkHandle(this.props.metaData['previous'])} className="previous">Previous</Link>
        ) : ('')}
        <ul class="pagination">

          {this.props.metaData['previous']  ? (
            <li><Link to={this.getPageLink(this.props.metaData['previous'])} onClick={event => this.linkHandle(this.props.metaData['previous'])}>{this.props.metaData['previous']}</Link></li>
          ) : ('')}

          <li class="active"><a>{this.props.metaData['current_page']}</a></li>

          {this.props.metaData['next']  ? (
            <li><Link to={this.getPageLink(this.props.metaData['next'])} onClick={event => this.linkHandle(this.props.metaData['next'])}>{this.props.metaData['next']}</Link></li>
          ) : ('')}

        </ul>
        {this.props.metaData['next'] ? (
          <Link to={this.getPageLink(this.props.metaData['next'])} onClick={event => this.linkHandle(this.props.metaData['next'])} className="next">Next</Link>
      ) : ('')}
      </div>
      ) : ("")

    ) : ("")}
    </div>
    )
  }
}

const SelectFilter = withRouter(DropDownCommonSelect);
const SearchComponent = withRouter(SearchInput);
const PaginationComponent = withRouter(Pagination);

class Search extends React.Component {
  render() {
    return (
      <div>
        <Router>
          <AllFilterData />
        </Router>
      </div>
    );
  }
}

//render whole app
if (document.querySelector('#js-product-search')) {
  ReactDOM.render(e(Search), document.querySelector('#js-product-search'));
}
