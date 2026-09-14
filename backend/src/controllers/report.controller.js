const Report = require('../models/report.model');
const {
  format,
  parse,
  eachDayOfInterval,
  eachMonthOfInterval,
  startOfMonth,
  endOfMonth
} = require('date-fns');

exports.generateSalesReport = async (req, res) => {
  const { from, to, type, detailed } = req.query;

  if (!from || !to || !type) {
    return res.status(400).json({ error: 'Faltan parámetros: from, to, type.' });
  }

  try {
    let reportData;

    switch (type) {
      case 'day':
        if (detailed === 'true') {
          reportData = await Report.getDetailedDailySalesReport(from);
        } else {
          reportData = await Report.getDailySalesList(from);
        }
        break;

      case 'month':
        const parsedFrom = parse(from, 'yyyy-MM-dd', new Date());
        const monthStartDate = startOfMonth(parsedFrom);
        const monthEndDate = endOfMonth(parsedFrom);

        const monthlySales = await Report.getMonthlySalesSummary(monthStartDate, monthEndDate);
        const daysInSelectedMonth = eachDayOfInterval({
          start: monthStartDate,
          end: monthEndDate
        });

        reportData = daysInSelectedMonth.map(date => {
          const formattedDate = format(date, 'yyyy-MM-dd');
          const salesForDay = monthlySales.find(sale => sale.date === formattedDate);
          return {
            date: formattedDate,
            total_sales: salesForDay ? salesForDay.total_sales : 0,
            total_profit: salesForDay ? salesForDay.total_profit : 0
          };
        });
        break;

      case 'year':
        const parsedYear = parse(from, 'yyyy-MM-dd', new Date());
        const year = parsedYear.getFullYear();

        const yearStartDate = new Date(year, 0, 1);
        const yearEndDate = new Date(year, 11, 31);

        const formattedFromYear = format(yearStartDate, 'yyyy-MM-dd');
        const formattedToYear = format(yearEndDate, 'yyyy-MM-dd');

        const yearlySales = await Report.getYearlySalesSummary(formattedFromYear, formattedToYear);

        const monthsInSelectedYear = eachMonthOfInterval({
          start: yearStartDate,
          end: yearEndDate
        });

        reportData = monthsInSelectedYear.map(date => {
          const formattedMonth = format(date, 'yyyy-MM');
          const salesForMonth = yearlySales.find(sale => sale.month === formattedMonth);
          return {
            date: formattedMonth,
            total_sales: salesForMonth ? salesForMonth.total_sales : 0,
            total_profit: salesForMonth ? salesForMonth.total_profit : 0
          };
        });
        break;

      default:
        return res.status(400).json({ error: 'Tipo de reporte no válido.' });
    }

    res.json(reportData);
  } catch (error) {
    console.error('Error en generateSalesReport:', error);
    res.status(500).json({ error: error.message || 'Error al generar el reporte.' });
  }
};

exports.generateRepairsReport = async (req, res) => {
  const { from, to, type } = req.query;

  if (!from || !to || !type) {
    return res.status(400).json({ error: 'Faltan parámetros: from, to, type.' });
  }

  try {
    let reportData;

    switch (type) {
      case 'day':
        reportData = await Report.getDailyRepairsList(from);
        break;

      case 'month':
        const parsedFrom = parse(from, 'yyyy-MM-dd', new Date());
        const monthStartDate = startOfMonth(parsedFrom);
        const monthEndDate = endOfMonth(parsedFrom);

        const monthlyRepairs = await Report.getMonthlyRepairsSummary(monthStartDate, monthEndDate);
        const daysInSelectedMonth = eachDayOfInterval({
          start: monthStartDate,
          end: monthEndDate
        });

        reportData = daysInSelectedMonth.map(date => {
          const formattedDate = format(date, 'yyyy-MM-dd');
          const repairsForDay = monthlyRepairs.find(repair => repair.date === formattedDate);
          return {
            date: formattedDate,
            total_repairs: repairsForDay ? repairsForDay.total_repairs : 0,
            total_profit: repairsForDay ? repairsForDay.total_profit : 0
          };
        });
        break;

      case 'year':
        const parsedYear = parse(from, 'yyyy-MM-dd', new Date());
        const year = parsedYear.getFullYear();

        const yearStartDate = new Date(year, 0, 1);
        const yearEndDate = new Date(year, 11, 31);

        const formattedFromYear = format(yearStartDate, 'yyyy-MM-dd');
        const formattedToYear = format(yearEndDate, 'yyyy-MM-dd');

        const yearlyRepairs = await Report.getYearlyRepairsSummary(formattedFromYear, formattedToYear);

        const monthsInSelectedYear = eachMonthOfInterval({
          start: yearStartDate,
          end: yearEndDate
        });

        reportData = monthsInSelectedYear.map(date => {
          const formattedMonth = format(date, 'yyyy-MM');
          const repairsForMonth = yearlyRepairs.find(repair => repair.month === formattedMonth);
          return {
            date: formattedMonth,
            total_repairs: repairsForMonth ? repairsForMonth.total_repairs : 0,
            total_profit: repairsForMonth ? repairsForMonth.total_profit : 0
          };
        });
        break;

      default:
        return res.status(400).json({ error: 'Tipo de reporte no válido.' });
    }

    res.json(reportData);
  } catch (error) {
    console.error('Error en generateRepairsReport:', error);
    res.status(500).json({ error: error.message || 'Error al generar el reporte.' });
  }
};
