"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function throwErrorMessage(message = 'Invalid Request Body', status = 400) {
    const error = {};
    error.status = status;
    error.message = message;
    throw error;
}
function typeCheck(vts) {
    vts.name = vts.name || '{property}';
    let genericError = "Invalid " + vts.name + " [" + vts.data + "]";
    if (vts.data === undefined) {
        throwErrorMessage(genericError + ": missing");
    }
    if (vts.type === 'array') {
        if (vts.data.constructor.name.toLowerCase() === 'array') {
            return vts.data;
        }
        throwErrorMessage(genericError + ": actual type:" + vts.data.constructor.name.toLowerCase() + ", expected type:array");
    }
    if (typeof vts.data !== vts.type) {
        throwErrorMessage(genericError + ": actual type:" + (typeof vts.data) + ", expected type:" + vts.type);
    }
    return vts.data;
}
function checkEqual(data, equal, genericError) {
    if (equal) {
        if (data === equal) {
            return data;
        }
        else {
            throwErrorMessage(genericError + ": actual value:" + data + ", expected value:" + equal);
        }
    }
}
function checkAnyOf(data, anyOf, genericError) {
    if (anyOf) {
        if (anyOf.indexOf(data) !== -1) {
            return data;
        }
        else {
            throwErrorMessage(genericError + ": actual value:" + data + ", expected value in:" + JSON.stringify(anyOf));
        }
    }
}
function checkMinMax(data, min, max, genericError) {
    if (min && max) {
        if (data >= min && data <= max) {
            return data;
        }
        else {
            throwErrorMessage(genericError + ": actual value:" + data + ", expected range:[" + min + "," + max + "]");
        }
    }
    if (min) {
        if (data >= min) {
            return data;
        }
        else {
            throwErrorMessage(genericError + ": actual value:" + data + ", expected range:[" + min + ",]");
        }
    }
    if (max) {
        if (data <= max) {
            return data;
        }
        else {
            throwErrorMessage(genericError + ": actual value:" + data + ", expected range:[," + max + "]");
        }
    }
}
function anyValidate(vs) {
    vs.name = vs.name || '{property}';
    let genericError = "Invalid " + vs.name + "[" + vs.data + "]";
    if (vs.defaultValue) {
        vs.data = vs.data || vs.defaultValue;
    }
    return vs.data;
}
function numberValidator(vs) {
    //console.log('numberValidator',{name,data,equal,min,max,anyOf})
    vs.name = vs.name || '{property}';
    let genericError = "Invalid " + vs.name + "[" + vs.data + "]";
    if (vs.defaultValue) {
        vs.data = vs.data || vs.defaultValue;
    }
    if (isNaN(parseInt(vs.data)))
        throwErrorMessage(genericError + ": expected number type");
    vs.data = parseInt(vs.data);
    vs.data = typeCheck(vs);
    if (checkEqual(vs.data, vs.equal, genericError)) {
        return vs.data;
    }
    if (checkAnyOf(vs.data, vs.anyOf, genericError)) {
        return vs.data;
    }
    if (checkMinMax(vs.data, vs.min, vs.max, genericError)) {
        return vs.data;
    }
    return vs.data;
}
function stringValidate(vs) {
    //console.log('stringValidate',{name,data,min,max,size,regex,trim,lower,upper,equal,anyOf})
    vs.name = vs.name || '{property}';
    let genericError = "Invalid " + vs.name + "[" + vs.data + "]: ";
    if (vs.defaultValue) {
        vs.data = vs.data || vs.defaultValue;
    }
    vs.data = typeCheck(vs);
    if (vs.trim) {
        vs.data = vs.data.trim();
    }
    if (vs.lower) {
        vs.data = vs.data.toLowerCase();
    }
    else if (vs.upper) {
        vs.data = vs.data.toUpperCase();
    }
    if (checkEqual(vs.data, vs.equal, genericError)) {
        return vs.data;
    }
    if (checkAnyOf(vs.data, vs.anyOf, genericError)) {
        return vs.data;
    }
    if (vs.regex) {
        if (new RegExp(vs.regex).test(vs.data)) {
            return vs.data;
        }
        else {
            throwErrorMessage(genericError + ": regex does not match :/" + vs.regex + "/");
        }
    }
    if (checkEqual(vs.data.length, vs.size, genericError)) {
        return vs.data;
    }
    if (checkMinMax(vs.data.length, vs.min, vs.max, genericError)) {
        return vs.data;
    }
    return vs.data;
}
function arrayValidate(vs) {
    vs.name = vs.name || '{property}';
    let genericError = "Invalid " + vs.name;
    if (vs.array_defaultValue) {
        vs.data = vs.data || vs.array_defaultValue;
    }
    vs.data = typeCheck(vs);
    genericError += "[" + JSON.stringify(vs.data) + "]";
    if (checkEqual(vs.data.length, vs.array_size, genericError)) {
    }
    else if (checkMinMax(vs.data.length, vs.array_min, vs.array_max, genericError)) {
    }
    vs.array_item_type = vs.array_item_type || 'any';
    if (vs.array_normalize) {
        vs.data = vs.data.filter((value, index, self) => {
            return value !== undefined && value !== null;
        });
    }
    for (let i in vs.data) {
        const temp = JSON.parse(JSON.stringify(vs));
        temp.data = vs.data[i];
        temp.type = vs.array_item_type;
        vs.data[parseInt(i)] = validateProperty(temp);
    }
    if (vs.array_unique) {
        vs.data = vs.data.filter((value, index, self) => {
            return self.indexOf(value) === index;
        });
    }
    return vs.data;
}
function validateProperty(i) {
    let result = '';
    switch (i.type) {
        case 'array':
            result = arrayValidate(i);
            break;
        case 'number':
            result = numberValidator(i);
            break;
        case 'string':
            result = stringValidate(i);
            break;
        default:
            result = anyValidate(i);
    }
    return result;
}
function getValueFromJsonPath(input, path) {
    let temp = input;
    for (const p of path.split('.')) {
        if (p in temp === false) {
            return undefined;
        }
        else {
            temp = temp[p];
        }
    }
    return temp;
}
function setValueByJsonPath(output, path, value) {
    let temp = output;
    const pathParts = path.split('.');
    const ppp = pathParts.pop();
    for (const p of pathParts) {
        if (p in temp === false) {
            temp[p] = {};
        }
        temp = temp[p];
    }
    if (ppp)
        temp[ppp] = value;
}
function checkSchema(reqBody, schemas) {
    const result = {};
    for (const schema of schemas) {
        let value = getValueFromJsonPath(reqBody, schema.name);
        if (value === undefined) {
            if (schema.optional === true) {
                continue;
            }
        }
        schema.data = value;
        try {
            value = validateProperty(schema);
            setValueByJsonPath(result, schema.name, value);
        }
        catch (error) {
            if (schema.optional !== true) {
                throw error;
            }
        }
    }
    return result;
}
function validateRequestBody(schemas) {
    return (req, res, next) => {
        console.log('validateRequestBody', schemas);
        try {
            req.body = checkSchema(req.body, schemas);
            next();
        }
        catch (error) {
            return res.status(error.status || 500).send(error.message || 'Unknown Server Issue');
        }
    };
}
exports.default = validateRequestBody;
