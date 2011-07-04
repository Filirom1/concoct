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
package org.filirom1.concoct.haml;


import org.junit.Assert;
import org.junit.Test;

/**
 * @author Filirom1
 */
public class HamlCompilerTest {

    @Test
    public void testCompile() {
        //fixture
        String haml = ".content Hello, World!";
        String html = "<div class=\\\"content\\\">Hello, World!</div>";

        //execute
        String compiled = null;
        try {
            compiled = new HamlCompiler().compile(haml);
        } catch (Exception e) {
            e.printStackTrace();
            Assert.fail();
        }

        //check
        Assert.assertEquals(html, compiled);

    }
}
