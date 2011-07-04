/*
 * Copyright 2011 Romain Philibert
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package org.jcofeescript;

import org.apache.commons.io.FileUtils;
import org.jcoffeescript.JCoffeeScriptCompileException;
import org.jcoffeescript.JCoffeeScriptCompiler;
import org.junit.Assert;
import org.junit.Test;

import java.io.File;
import java.io.IOException;

/**
 * @author Filirom1
 */
public class JCoffeeScriptCompilerTest {

    @Test
    public void testCompile() throws IOException {
        //fixture
        String js = FileUtils.readFileToString(new File(getClass().getClassLoader().getResource("test.js").getFile()));
        String coffee = FileUtils.readFileToString(new File(getClass().getClassLoader().getResource("test.js.coffee").getFile()));

        //execute
        String compiled = null;
        try {
            compiled = new JCoffeeScriptCompiler().compile(coffee);
        } catch (JCoffeeScriptCompileException e) {
            e.printStackTrace();
            Assert.fail("exception catched");
        }

        //check
        Assert.assertEquals(js, compiled);

    }
}
