// Helper to insert a Tax

function helpers(base) {

  const headers = base.config.get('gateway:defaultHeaders');

  const productMapBySku = new Map();
  const categoryMapByTitle = new Map();
  const timeout = base.config.get('timeout');
  const defaultRetryInterval = base.config.get('retryInterval');
  const defaultRetryTimes = base.config.get('retryTimes');

  const setProperty = (obj, property, value, parent) => {
    if (typeof parent === 'object') {
      parent[property] = value;
    } else {
      obj[property] = value;
    }
  };

  function productIdBySku(obj, property, sku, retryTimes, retryInterval, parent) {
    const existingProduct = productMapBySku.get(sku);
    if (existingProduct) {
      setProperty(obj, property, existingProduct, parent);
      return Promise.resolve();
    }
    return base.services.call({
      name: 'catalog:product.list',
      headers,
      timeout
    }, { sku })
      .then((result) => {
        if (result.ok === false || (result.data && result.data.length == 0)) {
          if (retryTimes === 0) throw new Error(`Product not found '${sku}'`);
          return new Promise((resolve) => {
            setTimeout(() => {
              resolve(productIdBySku(obj, property, sku, retryTimes - 1, retryInterval, parent));
            }, retryInterval);
          })
        }
        productMapBySku.set(sku, result.data[0].id);
        setProperty(obj, property, result.data[0].id, parent);
      });
  }

  const categoryIdByTitle = (obj, property, title, retryTimes, retryInterval, parent) => {
    const existingCategory = categoryMapByTitle.get(title);
    if (existingCategory) {
      setProperty(obj, property, existingCategory, parent);
      return Promise.resolve();
    }
    return base.services.call({
      name: 'catalog:category.list',
      headers,
      timeout
    }, { title })
      .then((result) => {
        if (result.ok === false || (result.data && result.data.length == 0)) {
          if (retryTimes === 0) throw new Error(`Category not found '${title}'`);
          return new Promise((resolve) => {
            setTimeout(() => {
              resolve(categoryIdByTitle(obj, property, title, retryTimes - 1, retryInterval, parent));
            }, retryInterval);
          })
        }
        categoryMapByTitle.set(title, result.data[0].id);
        setProperty(obj, property, result.data[0].id, parent);
      });
  };

  const allowedFunctions = {
    categoryIdByTitle,
    productIdBySku
  };

  function handleFunction(promises, obj, property, value) {
    const mach = value.match(/^(\w*[^ ])\((.*)\)$/);
    if (mach) {
      if (allowedFunctions[mach[1]]) {
        promises.push(allowedFunctions[mach[1]](obj, property, mach[2], defaultRetryTimes, defaultRetryInterval));
      } else {
        throw new Error(`Unrecognized function '${mach[0]}-${mach[1]}'`);
      }
    }
  }

  function handleFunctions(promises, obj, parent) {
    for (const property in obj) {
      if (obj.hasOwnProperty(property)) {
        if (typeof obj[property] === 'object') {
          handleFunctions(promises, obj[property], property);
        } else {
          if (typeof obj[property] === 'string') handleFunction(promises, obj, property, obj[property], parent);
        }
      }
    }
    return promises;
  }

  function insertTax(data) {
    return Promise.all(handleFunctions([], data))
      .then((r) => {
        return base.services.call({
          name: 'tax:tax.create',
          headers,
          timeout
        }, data);
      });
  }

  function insertShipping(data) {
    return Promise.all(handleFunctions([], data))
      .then((r) => {
        return base.services.call({
          name: 'cart:shipping.create',
          headers,
          timeout
        }, data);
      });
  }

  function insertCategory(data) {
    return Promise.all(handleFunctions([], data))
      .then(() => {
        return base.services.call({
          name: 'catalog:category.create',
          headers,
          timeout
        }, data);
      });
  }

  function insertProduct(data) {
    return Promise.all(handleFunctions([], data))
      .then(() => {
        return base.services.call({
          name: 'catalog:product.create',
          headers,
          timeout
        }, data);
      });
  }

  function insertPromotion(data) {
    return Promise.all(handleFunctions([], data))
      .then(() => {
        return base.services.call({
          name: 'promotion:promotion.create',
          headers,
          timeout
        }, data);
      });
  }

  function insertPayment(data) {
    return Promise.all(handleFunctions([], data))
      .then(() => {
        return base.services.call({
          name: 'payment:payment.create',
          headers,
          timeout
        }, data);
      });
  }

  function insertOAuthClient(data) {
    return Promise.all(handleFunctions([], data))
      .then(() => {
        return base.services.call({
          name: 'oauth:oauth.client.create',
          headers,
          timeout
        }, data);
      });
  }

  return {
    insertTax,
    insertCategory,
    insertProduct,
    insertPromotion,
    insertShipping,
    insertPayment,
    insertOAuthClient
  };
}

module.exports = helpers;
