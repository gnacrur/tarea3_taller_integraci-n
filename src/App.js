import React, { useState, useEffect} from 'react';
import './App.css';
import io from 'socket.io-client';

import Button from '@material-ui/core/Button';
import { makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import PropTypes from 'prop-types';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import Chart from "react-google-charts";
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormControl from '@material-ui/core/FormControl';
import FormLabel from '@material-ui/core/FormLabel';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';

const useStyles = makeStyles((theme) => ({
  margin: {
    margin: theme.spacing(1),
  },
  root: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.paper,
  },
  heading: {
    fontSize: theme.typography.pxToRem(15),
    fontWeight: theme.typography.fontWeightBold,
  },
  secondaryHeading: {
    fontSize: theme.typography.pxToRem(15),
    fontWeight: theme.typography.fontWeightRegular,
    marginLeft: 5
  },
  paper: {
    padding: theme.spacing(2),
    textAlign: 'center',
    color: theme.palette.text.secondary,
    justifyContent: "center",
    alignItems: "center"
  },
  
}));

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.any.isRequired,
  value: PropTypes.any.isRequired,
};

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box p={3}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

function getTiempo(stamp){
  var date = new Date(stamp);
  var hours = date.getHours();
  var minutes = "0" + date.getMinutes();
  var seconds = "0" + date.getSeconds();
  var formattedTime = hours + ':' + minutes.substr(-2) + ':' + seconds.substr(-2);
  return formattedTime

}

let socket; 

function App() {

  const [stocks, setStocks] = useState([])
  const [stocksVolBuy, setStocksVolBuy] = useState([])
  const [stocksVolSell, setStocksVolSell] = useState([])
  const [stocksRaw, setStocksRaw] = useState([])
  const [conectado, setConectado] = useState(true)
  const [exchanges, setExchanges] = useState([])
  const [stockdata, setStockData] = useState([])

  const classes = useStyles();
  const [value, setValue] = React.useState(0);
  const [value2, setValue2] = React.useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };
  
  

  useEffect(function effectFunction() {     
    socket.on('UPDATE', (stock_info) => {setStocksRaw(prev =>[ stock_info, ...prev ])});
    socket.on('BUY', (stock_info) => {setStocksVolBuy(prev =>[ stock_info, ...prev ])}); 
    socket.on('SELL', (stock_info) => {setStocksVolSell(prev =>[ stock_info, ...prev ])});
    socket.emit('EXCHANGES');
    socket.on('EXCHANGES', (exchanges) => {setExchanges(exchanges)});
    socket.emit('STOCKS');
    socket.on('STOCKS', (stocks_data) => {setStockData(stocks_data)});
}, [])

useEffect(function effectFunction() {
  if (typeof stocksRaw[0] !== "undefined" ){ 
    let i = 0;
    let estaba = false;
    for (const stock of stocks){
      if (stock.ticker === stocksRaw[0].ticker){
        const lista_stocks = [...stocks];
        lista_stocks[i].value = stocksRaw[0].value
        lista_stocks[i].values_sin_tiempo = [...lista_stocks[i].values_sin_tiempo,  stocksRaw[0].value]
        lista_stocks[i].values = [...lista_stocks[i].values, [getTiempo(stocksRaw[0].time) , stocksRaw[0].value]]
        lista_stocks[i].bajo =  Math.min(...lista_stocks[i].values_sin_tiempo);
        lista_stocks[i].alto =  Math.max(...lista_stocks[i].values_sin_tiempo);
        lista_stocks[i].cambio = (100*(lista_stocks[i].values_sin_tiempo[1]-lista_stocks[i].values_sin_tiempo[0])/lista_stocks[i].values_sin_tiempo[1]).toFixed(2) 
        setStocks([...lista_stocks])
        estaba = true;
      }
      i++;
    }
    if (!estaba){
      const stock_extendido = {
        ...stocksRaw[0], 
        bajo: stocksRaw[0].value, 
        alto: stocksRaw[0].value,
        cambio: 0,
        values:[[getTiempo(stocksRaw[0].time),stocksRaw[0].value]],
        values_sin_tiempo:[],
        buy: 0,
        sell: 0,
        volumen: 0 }
      
      setStocks(prev =>[...prev, stock_extendido ])
    }

  }}, [stocksRaw])

useEffect(function effectFunction() {
  if (typeof stocksVolBuy[0] !== "undefined" ){
    let i = 0;
    for (const stock of stocks){
      if (stock.ticker === stocksVolBuy[0].ticker){
        const lista_stocks = [...stocks];
        if (typeof lista_stocks[i].buy !== "undefined" ){ 
          lista_stocks[i].buy = stocksVolBuy[0].volume
          lista_stocks[i].volumen = lista_stocks[i].buy + lista_stocks[i].sell
          setStocks([...lista_stocks])}
      }
      i++;
    }  
  }}, [stocksVolBuy])

useEffect(function effectFunction() {
  if (typeof stocksVolSell[0] !== "undefined" ){ 
    let i = 0;
    for (const stock of stocks){
      if (stock.ticker === stocksVolSell[0].ticker){
        const lista_stocks = [...stocks];
        if (typeof lista_stocks[i].sell !== "undefined" ){ 
          lista_stocks[i].sell = stocksVolSell[0].volume
          lista_stocks[i].volumen = lista_stocks[i].buy + lista_stocks[i].sell
          setStocks([...lista_stocks])}
      }
      i++;
    }  
  }}, [stocksVolSell])

useEffect(function effectFunction() { 
  const lista_stocks = [...stocks];        
  for (const stock_info of stockdata){        
      let i = 0;
      let estaba = false;
      for (const stock of stocks){
        if (stock.ticker === stock_info["ticker"]){  
          estaba = true                              
          lista_stocks[i] = {
            ...lista_stocks[i], 
            company: stock_info["company_name"],
            origen: stock_info["country"], 
            moneda: stock_info["quote_base"]}               
        }
        i++;
      }
      if (!estaba){
        const stock_extendido = {
          company:  stock_info["company_name"],
          ticker: stock_info["ticker"],
          values: [],
          values_sin_tiempo: [],
          buy: 0,
          sell: 0,
          origen: stock_info["country"], 
          moneda: stock_info["quote_base"]}
        lista_stocks.push(stock_extendido);
      }
    }
    setStocks([...lista_stocks])
    }
    , [stockdata])

useEffect(function effectFunction() {  
  if(Object.keys(exchanges).length !== 0){ 
    let exchanges_data = {...exchanges};
    let volumen_total = 0;     
    for (let exchange of Object.keys(exchanges_data)){ 
      exchanges_data[exchange].numero_acciones = exchanges_data[exchange].listed_companies.length
      let buy = 0;
      let sell = 0;
      let volumen = 0;
      for (const empresa of exchanges_data[exchange].listed_companies){
        for (const stock of stocks){
          if (stock.company === empresa){
            buy += stock.buy
            sell += stock.sell
            volumen += stock.volumen
          }
        }
      }
      exchanges_data[exchange].buy = buy
      exchanges_data[exchange].sell = sell
      exchanges_data[exchange].volumen = volumen
    }for (let exchange1 of Object.keys(exchanges_data)){ 
      volumen_total += exchanges_data[exchange1].volumen}
    for (let exchange2 of Object.keys(exchanges_data)){ 
      exchanges_data[exchange2].participacion = (100*(exchanges_data[exchange2].volumen/volumen_total)).toFixed(2)  }
    setExchanges(exchanges_data);    
    }
  }, [stocks])

    

  if (!socket){
    socket = io('wss://le-18262636.bitzonte.com', {
      path: '/stocks'
    });
    }
  
const handleConnect = () => {
  setConectado(conectado? false: true)
  if (conectado){ socket.disconnect()}
  else{socket.connect();
    socket.emit('EXCHANGES');
    socket.emit('STOCKS');} ;
  
}    
  
  
  

  return (
    <div className={classes.root} >
      <AppBar position="static">
        <Tabs value={value} onChange={handleChange} aria-label="simple tabs example" style={{flex:1}}>
          <Tab label="Stocks" {...a11yProps(0)} />
          <Tab label="Exchanges" {...a11yProps(1)} />
          <Button variant="contained"  style={{position:'absolute',top: 5, right: 40, alignRight:'flex-end'}} onClick={() => handleConnect()}>{conectado? "Desconectarse": "Conectarse"}</Button>
        </Tabs>
      </AppBar>
      <TabPanel value={value} index={0}>               
        <Grid className={classes.root} container spacing={2}>
          <Grid container item xs>
            
              <FormControl component="fieldset" style={{marginLeft:'20px', marginTop:'15px'}}>
                <FormLabel component="legend">Datos del Gráfico</FormLabel>
                <RadioGroup aria-label="gender" name="gender1" value={value2} onChange={(e) => setValue2(parseInt(e.target.value))}>
                {stocks.map((stock, i) => <FormControlLabel value={i} control={<Radio />} label={stock.ticker} />)}
                </RadioGroup>
              </FormControl>
            
          </Grid>
          <Grid item xs >
            {stocks.map((stock, i) => {
              if (parseInt(i) === value2)
              return <Chart
                      width={'1000px'}
                      height={'400px'}
                      chartType="LineChart"
                      loader={<div>Loading Chart</div>}
                      data={[
                        ['x', stock.ticker],
                        ...stock.values
                        
                      ]}
                      options={{
                        title: 'Precio de la acción vs Tiempo',
                        hAxis: {
                          title: 'Tiempo',
                        },
                        vAxis: {
                          title: stock.moneda,
                        },
                      }}
                      rootProps={{ 'data-testid': '1' }}
                    />})}
          </Grid>
          <Grid item xs={12} >
              {stocks.map(stock => 
            <ExpansionPanel>
              <ExpansionPanelSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls={stock.company}
                id={stock.company}
              >
                <Typography className={classes.heading}>{stock.company} ({stock.ticker})</Typography>
            <Typography className={classes.secondaryHeading}>$ {stock.value} {stock.moneda}</Typography>
              </ExpansionPanelSummary>
              <ExpansionPanelDetails>
                <Typography>
                Bajo: $ {stock.bajo} {stock.moneda} | Alto: ${stock.alto} {stock.moneda} | Cambio Porcentual: {stock.cambio}% | Volumen: {stock.volumen} | Pais de Origen: {stock.origen} 
                </Typography>            
              </ExpansionPanelDetails>
            </ExpansionPanel>
            )}
         </Grid>
        </Grid>
         
        
      </TabPanel>
      <TabPanel value={value} index={1}>      
       {Object.values(exchanges).map(exchange => 
            <ExpansionPanel>
              <ExpansionPanelSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls={exchange.name}
                id={exchange.ticker}>
                <Typography className={classes.heading}>{exchange.name} ({exchange.exchange_ticker})</Typography>
                <Typography className={classes.secondaryHeading}> Participación Mercado: {exchange.participacion} %</Typography>
              </ExpansionPanelSummary>
              <ExpansionPanelDetails>
                <Typography>
                Buy: {exchange.buy} | Sell: {exchange.sell} | Volumen: {exchange.volumen} | Cantidad acciones: {exchange.numero_acciones} ({exchange.listed_companies})
                </Typography>            
              </ExpansionPanelDetails>
            </ExpansionPanel>)}
      </TabPanel>
    </div>
  );
}

export default App;
