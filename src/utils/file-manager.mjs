/**
 * Module that handles file management (reading and writing)
 */

"use strict"

import { readFile } from 'node:fs/promises'
import { writeFile } from 'node:fs/promises'

export const readFileContents = async (fileName) => {
    return readFile(fileName, 'utf8', (err, data) => {
        if (err) throw err
    })
}

export const writeFileContents = async (filePath, contents) => {
    return writeFile(filePath, contents, (err) => {
        if (err) throw err
    }) 
}